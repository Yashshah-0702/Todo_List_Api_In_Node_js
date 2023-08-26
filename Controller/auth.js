const User = require("../Model/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const { validationResult } = require("express-validator");

const error = require("../Error_handling/error");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yash72200002@gmail.com",
    pass: "xszbemuusaprolkp",
  },
});

exports.SignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const error = new Error(
    //   "signup failed please enter valid email address or password..."
    // );
    // error.statusCode = 422;
    // throw error;
    error.error(
      "signup failed please enter valid email address or password...",
      422
    );
  }
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((result) => {
      return res
        .status(200)
        .json({ message: "Profile added successfully", userId: result._id });
    })
    .then(() => {
      return transporter.sendMail({
        to: email,
        from: "yash72200002@gmail.com",
        subject: "SignUp Succedded!",
        html: "<h1>You have successfully signed up.</h1>",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.Login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadeduser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // const error = new Error("User with this email id does not exists..");
        // error.statusCode = 401;
        // throw error;
        error.error("User with this email id does not exists..", 401);
      }
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((IsEqual) => {
      if (!IsEqual) {
        error.error("Incorrect Password", 401);
      }
      const token = jwt.sign(
        { email: loadeduser.email, userId: loadeduser._id.toString() },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      return res.status(200).json({
        message: "Login Succeded",
        token: token,
        userId: loadeduser._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateUser = (req, res, next) => {
  const userId = req.params.userId;
  const email = req.body.email;
  const password = req.body.password;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        error.error("Profile not found", 404);
      }
      if (user._id.toString() !== req.userId) {
        error.error("Not authorised", 403);
      }
      user.email = email;
      user.password = password;
      return user.save();
    })
    .then((profile) => {
      return res
        .status(201)
        .json({
          status: "true",
          message: "Profile updated succesfully",
          userId: profile._id,
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    });
};

exports.deleteUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then(() => {
      return User.findByIdAndRemove(userId);
    })
    .then((user) => {
      if (!user) {
        error.error("Pser not found", 404);
      }
      if (user.id.toString() !== req.userId) {
        error.error("Not authorised", 403);
      }
    })
    .then(() => {
      return res
        .status(201)
        .json({ status: "true", message: "Profile deleted successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
