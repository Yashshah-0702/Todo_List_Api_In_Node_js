const express = require("express");

const path = require("path");

const bodyParser = require("body-parser");

const multer = require("multer");

const { fileStorage, fileFilter } = require("./utils/multer");

const connectToDatabase = require("./utils/mongoose");

const Todos = require("./Routes/todo");

const Auth = require("./Routes/auth");

const ErrorHandling = require("./Error_handling/error");

const corsOptions = require("./utils/cors");

const app = express();

app.use(bodyParser.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("uploads")
);

app.use(express.static(path.join(__dirname, "uploads")));

app.use(corsOptions.Cors);

app.use(Todos);

app.use(Auth);

app.use(ErrorHandling.errorHandling);

connectToDatabase
  .then(() => {
    console.log("Connected to database");
    app.listen(7000);
  })
  .catch((err) => {
    console.log(err);
  });
