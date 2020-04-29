// ========= PACKAGES/DEPENDENCIES ============ \\
const express = require("express");
//HOOKS INTO ROUTES & CONSOLE.LOG REQ & RES
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");
//SET HOST PORT OR 3000
const PORT = process.env.PORT || 3000;
//INITIATE EXPRESS APP
const app = express();
//LOGGER WILL THROW ERROR ON LOGGING REQUESTS
app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
//PARSE REQUEST BODY AS JSON
app.use(express.json());
//MAKE PUBLIC FOLDER A STATIC DIRECTORY
app.use(express.static("public"));
//CONNECT TO MONGOOSE/MONGODB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}).catch(error => handleError(error));
//MONGOOSE CONNECTION STORED IN VARIABLE DB
mongoose.connection.on("error", (error) => {
  console.log("Mongoose Connection Error!: ", error);
}).once("open", () => console.log("Mongoose Connection Successful!!"));

//ROUTES-EVERY REQUEST GOES THROUGH ROUTE MIDDLEWARE
app.use(require("./routes/api.js"));

//START SERVER  
app.listen(PORT, () => {
    console.log(`App running on port http://localhost:${PORT}/ !`);
});