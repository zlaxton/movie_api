# movie_api
# Description
The server-side component of a “movies” web application provide users with access to information about different movies, directors, and genres. Users are able to sign up, update theirpersonal information, and create a list of their favorite movies.
# Feature Requirements
 - Return a list of ALL movies to the user
 - Return data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
 - Return data about a genre (description) by name/title (e.g., “Thriller”)
 - Return data about a director (bio, birth year, death year) by name
 - Allow new users to register
 - Allow users to update their user info (username, password, email, date of birth)
 - Allow users to add a movie to their list of favorites
 - Allow users to remove a movie from their list of favorites
 - Allow existing users to deregister
 # Technical Requirements
 - The API is a Node.js and Express application.
- The API use REST architecture, with URL endpoints corresponding to the data
operations listed above
- The API use at least three middleware modules, such as the body-parser package for
reading data from requests and morgan for logging.
- The API use a “package.json” file.
- The database is built using MongoDB.
- The business logic is modeled with Mongoose.
- The API provide movie information in JSON format.
- The JavaScript code is error-free.
- The API is tested in Postman.
- The API include user authentication and authorization code.
- The API include data validation logic.
- The API meet data security regulations.
- The API source code is deployed to a publicly accessible platform like GitHub.
- The API is deployed to Heroku.
# Dependencies
-bcrypt
-body-parser
-cors
-express
-express-validator
-jsonwebtoken
-lodash
-mongoose
-morgan
-nodemailer
-passport
-passport-jwt
-passport-local
-uuid
# Built with
-Javascript
-Node.js
-Express
-MongoDB
-Mongoose
