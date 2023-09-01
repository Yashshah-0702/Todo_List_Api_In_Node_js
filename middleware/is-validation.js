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

exports.UpdateUserValidation = [
  // Check if email is provided and validate it only when it's present
  body("email")
    .optional() // This makes the email field optional
    .isEmail()
    .withMessage("Please enter a valid email...")
    .custom((value, { req }) => {
      // Only check for email existence if an email is provided
      if (value) {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists..");
          }
        });
      }
      return true; // Return true if no email is provided
    })
    .normalizeEmail(),

  // Password validation (always checked when provided)
  body("password")
    .optional() // This makes the password field optional
    .trim()
    .isLength({ min: 5 }),
];

exports.CreatePostValidation = [
  body("title").trim().isLength({ min: 5, max: 70 }),
  body("content").not().isEmpty(),
  body("description").not().isEmpty(),
];

exports.UpdatePostValidation = [
  body("title").trim().isLength({ min: 5, max: 70 }),
  body("content").not().isEmpty(),
  body("description").not().isEmpty(),
];
