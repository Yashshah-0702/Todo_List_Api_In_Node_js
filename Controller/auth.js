const User = require("../Model/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const emailTemplate = require("../nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../Error_handling/error");

exports.SignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
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
      return emailTemplate.signUpMail(email);
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};

exports.Login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadeduser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        errorHandling.error("User with this email id does not exists..", 401);
      }
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((IsEqual) => {
      if (!IsEqual) {
        errorHandling.error("Incorrect Password", 401);
      }
      const token = jwt.sign(
        { email: loadeduser.email, userId: loadeduser._id.toString() },
        "somesupersecretsecret",
        { expiresIn: "7d" }
      );
      return res.status(200).json({
        message: "Login Succeded",
        token: token,
        userId: loadeduser._id.toString(),
      });
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};

exports.getSingleUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        errorHandling.error("Profile not found...", 404);
      }
      return res.status(200).json({
        status: "true",
        message: "Profile found successfully",
        user: user,
      });
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};

exports.updateUser = (req, res, next) => {
  const userId = req.params.userId;
  const email = req.body.email;
  const password = req.body.password;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        errorHandling.error("Profile not found", 404);
      }
      if (user._id.toString() !== req.userId) {
        errorHandling.error("Not authorised", 403);
      }
      user.email = email;
      user.password = password;
      return user.save();
    })
    .then((profile) => {
      return res.status(201).json({
        status: "true",
        message: "Profile updated succesfully",
        userId: profile._id,
      });
    })
    .catch((err) => {
      errorHandling.error500(err);
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
        errorHandling.error("User not found", 404);
      }
      if (user.id.toString() !== req.userId) {
        errorHandling.error("Not authorised", 403);
      }
    })
    .then(() => {
      return res
        .status(201)
        .json({ status: "true", message: "Profile deleted successfully" });
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};
