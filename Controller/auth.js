const User = require("../Model/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const emailTemplate = require("../Nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../Utils/error");

const messages = require("../Utils/messages");

exports.SignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
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
        .status(messages.CREATED.statuscode)
        .json({status:"True",message: messages.CREATED.message, userId: result._id,statusCode:messages.CREATED.statuscode });
    })
    .then(() => {
      return emailTemplate.signUpMail(email);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
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
        errorHandling.error(
          messages.UNAUTHORISED_EMAIL.message,
          messages.UNAUTHORISED_EMAIL.statuscode
        );
      }
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((IsEqual) => {
      if (!IsEqual) {
        errorHandling.error(
          messages.UNAUTHORISED_PASS.message,
          messages.UNAUTHORISED_PASS.statuscode
        );
      }
      const token = jwt.sign(
        { email: loadeduser.email, userId: loadeduser._id.toString() },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      return res.status(messages.SUCCESS.statuscode).json({
        status:"True",
        message: messages.SUCCESS.message,
        token: token,
        userId: loadeduser._id.toString(),
        statusCode:messages.SUCCESS.statuscode
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.getSingleUser = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        errorHandling.error(
          messages.NOT_FOUND.message,
          messages.NOT_FOUND.statuscode
        );
      }
      return res.status(messages.SUCCESS.statuscode).json({
        status:"True",
        message: messages.SUCCESS.message,
        user: user,
        statusCode:messages.SUCCESS.statuscode
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.updateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
    );
  }
  const userId = req.params.userId;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      return User.findById(userId)
        .then((user) => {
          if (!user) {
            errorHandling.error(
              messages.NOT_FOUND.message,
              messages.NOT_FOUND.statuscode
            );
          }
          if (user._id.toString() !== req.userId) {
            errorHandling.error(
              messages.FORBIDDEN.message,
              messages.FORBIDDEN.statuscode
            );
          }
          user.email = email;
          user.password = hashedPassword;
          return user.save();
        })
        .then((profile) => {
          return res.status(messages.SUCCESS.statuscode).json({
            status:"True",
            message: messages.SUCCESS.message,
            userId: profile._id,
            statusCode:messages.SUCCESS.statuscode
          });
        });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR.statuscode;
      }
      next(err);
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
        errorHandling.error(
          messages.NOT_FOUND.message,
          messages.NOT_FOUND.statuscode
        );
      }
      if (user._id.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode
        );
      }
    })
    .then(() => {
      return res
        .status(messages.SUCCESS.statuscode)
        .json({status:"True", message: messages.SUCCESS.message,statusCode: messages.SUCCESS.statuscode});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};
