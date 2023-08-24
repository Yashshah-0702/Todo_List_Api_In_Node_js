const { body } = require("express-validator");

const User = require("../Model/user");

exports.SignupValidation = [
  body("email")
    .isEmail()
    .withMessage("plz enter a valid email...")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email already exists..");
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
];

exports.CreatePostValidation = [
  body("title").trim().isLength({ min: 5, max: 12 }),
  body("content").not().isEmpty(),
];
