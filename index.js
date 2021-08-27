const express = require("express"),
  const morgan = require("morgan");
(bodyParser = require("body-parser")), (uuid = require("uuid"));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017//myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });



app.use(morgan("common"));

app.use("/public", express.static("public"));

let movies = [
  {
    id: "1",
    title: "Silence of the Lambs",
    year: "2016",
    director: "Jonathan Demme",
    genres: "Thriller",
    description:
      "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.",
  },
  {
    id: "2",
    title: "The Hobbit: The Battle of the Five Armies",
    year: "2014",
    director: "Peter Jackson",
    genres: "Adventure, Fantasy",
    description:
      "The Battle of Five Armies was a battle waged between the Orcs and the Wargs of the Misty Mountains and the Grey Mountains against the Lake-men, Elves, Dwarves, on and near the Lonely Mountain.",
  },

  {
    id: "3",
    title: "Indiana Jones and the Kingdom of the Crystal Skull",
    year: "2008",
    director: "Steven Spielberg",
    genres: "Adventure",
    description:
      "Released and taking place nineteen years after the previous film, it is set in 1957, pitting Indiana Jones (Harrison Ford) against Soviet agents led by Irina Spalko (Cate Blanchett)—searching for a telepathic crystal skull. ... The filmmakers intended to pay tribute to the science fiction B-movies of the 1950s era.",
  },

  {
    id: "4",
    title: "Minority Report",
    year: "2002",
    director: "Steven Spielberg",
    genres: "Mystery",
    description:
      "In a future where a special police unit is able to arrest murderers before they commit their crimes, an officer from that unit is himself accused of a future murder.",
  },
  {
    id: "5",
    title: "The Lord of the Rings: The Return of the King",
    year: "2003",
    director: "Peter Jackson",
    genres: "Adventure, Fantasy",
    description:
      "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
  },

  {
    id: "6",
    title: "The Terminal",
    year: "2004",
    director: "Steven Spielberg",
    genres: "Drama",
    description:
      "An Eastern European tourist unexpectedly finds himself stranded in JFK airport, and must take up temporary residence there.",
  },

  {
    id: "7",
    title: "War of the Worlds",
    year: "2005",
    director: "‎Steven Spielberg",
    genres: "Science fiction",
    description:
      "Sci-fi action film about an alien invasion threatening the future of humanity. The catastrophic nightmare is depicted through the eyes of one American family fighting for survival.",
  },
  {
    id: "8",
    title: "Divergent",
    year: "2014",
    director: "Neil Burger",
    genres: "Science fiction",
    description:
      "In a world divided by factions based on virtues, Tris learns she's Divergent and won't fit in. When she discovers a plot to destroy Divergents, Tris and the mysterious Four must find out what makes Divergents dangerous before it's too late.",
  },

  {
    id: "9",
    title: "Shutter Island",
    year: "2010",
    director: "Martin Scorsese",
    genres: "Thriller",
    description:
      "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.",
  },

  {
    id: "10",
    title: "The Godfather",
    year: "1972",
    director: "Francis Ford Coppola",
  },
  {
    id: "11",
    title: "Blood In Blood Out",
    year: "1993",
    director: "Taylor Hackford",
  },
];

app.get("/", (req, res) => {
  res.status(200).sendFile(`${__dirname}/public/index.html`);
});

// Gets the list of data about ALL movies
app.get("/movies", (req, res) => {
  res.json(movies);
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
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Deletes a movie from our list by id
app.delete("/movies/:id", (req, res) => {
  let movie = movies.find((movie) => {
    return movie.id === req.params.id;
  });

  if (movie) {
    movies = movies.filter((obj) => {
      return obj.id !== req.params.id;
    });
    res
      .status(201)
      .send("Movie with the ID of " + req.params.id + " was deleted.");
  } else {
    res.status(404).send(`Movie with the id ${req.params.id} was not found.`);
  }
});
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(8080, () => {
  console.log("Your App is listening on Port 8080");
});
