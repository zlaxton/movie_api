const express = require("express"),
  morgan = require("morgan");

const app = express();

app.use(morgan("common"));
app.use(express.static("public"));

let topMovies = [
  {
    title: "Flags of our Fathers",
    director: "Clint Eastwood",
  },
  {
    title: "Forrest Gump",
    director: "Robert Zemeckis",
  },
  {
    title: "Cast Away",
    director: "Robert Zemeckis",
  },
  {
    title: "Milk",
    director: "Gus Van Sant",
  },
  {
    title: "The Big Short",
    director: "Adam McKay",
  },
  {
    title: "The Wolf of Wall Street",
    director: "Martin Scorsese",
  },
  {
    title: "Yesterday",
    director: "Danny Boyle",
  },
  {
    title: "Parasite",
    director: "Bong Joon Ho",
  },
  {
    title: "Boston",
    director: "Peter Berg",
  },
  {
    title: "Deepwater Horizon",
    director: "Peter Berg",
  },
];

app.get("/", (req, res) => {
  res.send("My Flix App");
});

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.listen(8080, () => {
  console.log("Your App is listening on Port 8080");
});
