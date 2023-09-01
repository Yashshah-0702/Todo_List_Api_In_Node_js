const express = require("express");

const bodyParser = require("body-parser");

const multer = require("multer");

const { fileStorage, fileFilter } = require("./Utils/multer");

const connectToDatabase = require("./Utils/mongoose");

const Todos = require("./Routes/todo");

const Auth = require("./Routes/auth");

const ErrorHandling = require("./Utils/error");

const corsOptions = require("./Utils/cors");

const app = express();

app.use(bodyParser.json());

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 1024 * 1024 * 1,
    },
  }).single("uploads")
);

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
