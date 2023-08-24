const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const Todos = require("./Routes/todo");

const Auth = require("./Routes/auth");

const path = require("path");

const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageurl")
);

app.use(express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.use(Todos);

app.use(Auth);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    "meta":{
    status: "false",
    message: message,
    data: data,
    statusCode: status,
}});
});

mongoose
  .connect("mongodb+srv://Yash_Shah:y_a_s_h@cluster0.h0nmwav.mongodb.net/TODO")
  .then(() => {
    console.log("Connected to database");
    app.listen(7000);
  })
  .catch((err) => {
    console.log(err);
  });
