const express = require("express"),
  morgan = require("morgan");
(bodyParser = require("body-parser")), (uuid = require("uuid"));
const app = express();
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Directors;
const Genres = Models.Genres;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Log requests to server
app.use(morgan("common"));

app.use("/documentation", express.static("public"));

mongoose.connect("mongodb://localhost:27017//myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Welcome to myFlixDB!");
});

// Gets the list of data about ALL movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(201).json(movies);
  } catch (err) {
    res.json({ message: "Movies could not be accessed" });
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to my movies app");
});

// Get data about a certain movie
app.get("/movies/:title", (req, res) => {
  res.json(
    movies.find((movie) => {
      return movie.title === req.params.title;
    })
  );
});

app.get("/documentation", (req, res) => {
  res.status(200).sendFile(`${__dirname}/public/documentation.html`);
});

//Route to Data about Director  **************************************
app.get("/directors/:Name", async (req, res) => {
  try {
    const director = await Directors.findOne({ Name: req.params.Name });
    res.json(director);
  } catch (err) {
    res.json({ message: "Info about director could not be accessed" });
  }
});

//Route to Data about Genre  ****************************************
app.get("/genres/:genre", (req, res) => {
  Genres.find({ Genre: req.body.genre })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add a movie
app.post("/movies", (req, res) => {
  let newMovie = req.body;

  if (!newMovie.title) {
    const message = "Missing title in request body";
    res.status(400).send(message);
  } else {
    newMovie.id = uuid.v4();
    movies.push(newMovie);
    res.status(201).send(newMovie);
  }
});
// Update the year of a movie by title
app.put("/movies/:title/:year", (req, res) => {
  let movie = movies.find((movie) => {
    return (movie.title = req.params.title);
  });

  if (movie) {
    movie.year = parseInt(req.params.year);
    res
      .status(201)
      .send(
        `Movie ${req.params.title} was assigned the year of ${req.params.year}.`
      );
  } else {
    res
      .status(404)
      .send(`Movie wit the title ${req.params.title} was not found.`);
  }
});

// Creating a new user
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
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
});
// Get all users
app.get("/users", (req, res) => {
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
app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
// Update users with a certain name
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
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
});

// Add a movie to a user's list of favorites
app.post("/users/:Username/movies/:MovieID", (req, res) => {
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
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Route for users to remove movies from favorite list
app.delete("/users/:Username/movies/delete/:MovieID", (req, res) => {
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
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(8080, () => {
  console.log("Your App is listening on Port 8080");
});
