/**
 * @fileOverview In this file the endpoints for the API are defined.
 * @see <a href="https://movie_api.herokuapp.com/documentation.html">Table of all endpoints and data formats</a>
 */

const express = require("express");
const morgan = require("morgan"); // module for logging
const bodyParser = require("body-parser"); // module to parse the body of an API request (eg: "let newUser = req.body;")
const mongoose = require("mongoose"); // business layer logic to link Node and the MongoDB
const Models = require("./models.js"); // Mongoose models representing the movie_api_DB (MongoDB) collections
const uuid = require("uuid");
const app = express(); // encapsulate Express’s functionality to configure the web server

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
const cors = require("cors");

//Middleware
app.use(cors());
app.options("*", cors());
var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
};
app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("common"));
//app.use("/documentation", static("public"));

const auth = require("./auth.js")(app);

const passport = require("passport");
app.use(passport.initialize());
require("./passport");
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Welcome to myFlixDB!");
});
// Gets the list of data about ALL movies
app.get(
  "/movies",
  authenticate("jwt", { session: false }),
  function (req, res) {
    Movies.find()
      .then(function (movies) {
        res.status(201).json(movies);
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);
//Route to Data about Genre
app.get(
  "/genres/:Name",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Genres.findOne({ Name: req.params.Name })
      .then((genre) => {
        res.json(genre.Description);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
// Get data for certain movie
app.get(
  "/movies/:Title",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);
// get info on specific director
app.get(
  "/directors/:Name",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Directors.findOne({ Name: req.params.Name })
      .then((director) => {
        res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Get all users
app.get("/users", authenticate("jwt", { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by username
app.get(
  "/user/:Username",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

app.get("/documentation", (req, res) => {
  res.status(200).sendFile(`${__dirname}/public/documentation.html`);
});

/**
 * Add movie to favorites
 * @method POST
 * @param {string} endpoint - endpoint to add movies to favorites
 * @param {string} Title, Username - both are required
 * @returns {string} - returns success/error message
 */
app.post(
  "/users/:Username/movies/:MovieID",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      {
        Username: req.params.Username,
      },
      {
        $push: {
          FavoriteMovies: req.params.MovieID,
        },
      },
      {
        new: true,
      }, //this line makes sure that updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);
/**
 * Add user
 * @method POST
 * @param {string} endpoint - endpoint to add user. "url/users"
 * @param {string} Username - choosen by user
 * @param {string} Password - user's password
 * @param {string} Email - user's e-mail address
 * @param {string} Birthday - user's birthday
 * @returns {object} - new user
 */
app.post(
  "/users",
  [
    check("Username", "Username is required!").isLength({
      min: 5,
    }),
    check(
      "Username",
      "Username contains non alphanumerical characters!"
    ).isAlphanumeric(),
    check("Password", "Password is required!").not().isEmpty(),
    check("Email", "Email address is not valid!").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({
      Username: req.body.Username, //search user by username
    })
      .then((user) => {
        if (user) {
          //if user is found, send a response that is already exists
          return res.status(400).send(req.body.Username + " already exists!");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Add a movie to a user's list of favorites
app.post(
  "/users/:Username/movies/:MovieID",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);
/**
 * Update user by username
 * @method PUT
 * @param {string} endpoint - endpoint to add user. "url/users/:Username"
 * @param {string} Username - required
 * @param {string} Password - user's new password
 * @param {string} Email - user's new e-mail address
 * @param {string} Birthday - user's new birthday
 * @returns {string} - returns success/error message
 */
app.put(
  "/users/:Username",
  [
    check("Username", "Username is required!").isLength({
      min: 5,
    }),
    check(
      "Username",
      "Username contains non alphanumerical characters!"
    ).isAlphanumeric(),
    check("Password", "Password is required!").not().isEmpty(),
    check("Email", "Email adress is not valid!").isEmail(),
  ],
  authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
    Users.findOneAndUpdate(
      {
        Username: req.params.Username,
      },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      {
        new: true,
      }, //this line makes sure that updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Delete user by username
 * @method DELETE
 * @param {string} endpoint - endpoint - delete user by username
 * @param {string} Username - is used to delete specific user "url/users/:Username"
 * @returns {string} success/error message
 */
app.delete(
  "/users/:Username",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndDelete({
      Username: req.params.Username,
    })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found!");
        } else {
          res.status(200).send(req.params.Username + " was removed!");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Route for users to remove movies from favorite list
app.delete(
  "/users/:Username/movies/delete/:MovieID",
  authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.Username },
      {
        $pull: { favoriteMovie: req.params.MovieID },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
