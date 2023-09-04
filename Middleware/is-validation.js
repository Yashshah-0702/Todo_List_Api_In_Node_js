const { body } = require("express-validator");

const User = require("../Model/user");

exports.SignupValidation = [
  body("email")
    .trim()
    .customSanitizer((value) => {
      return value.replace(/\s+/g, "");
    })
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email already exists.");
        }
      });
    }),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password must be of 5 characters at least."),
  body("name")
    .trim()
    .isLength({ min: 4, max: 30 })
    .withMessage(
      "Name must be between 4 to 30 characters and must be full name."
    ),
  body("gender")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Gender is required."),
  body("age").trim().isNumeric().withMessage("Age is required."),
  body("address")
    .trim()
    .optional()
    .isLength({ min: 6, max: 60 })
    .withMessage("Address must be between 6 to 60 characters."),
];

exports.Login = [body("email").trim(), body("password").trim()];

exports.UpdateUserValidation = [
  body("email")
    .trim()
    .optional()
    .customSanitizer((value) => {
      return value.replace(/\s+/g, "");
    })
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Email already exists.");
        }
      });
    }),
  body("name")
    .trim()
    .optional()
    .isLength({ min: 4, max: 30 })
    .withMessage("Name must be between 4 to 30 characters."),
  body("gender")
    .trim()
    .optional()
    .isLength({ min: 3, max: 10 })
    .withMessage("Gender is required."),
  body("password")
    .trim()
    .optional()
    .isLength({ min: 5 })
    .withMessage("Password must be of 5 characters minimum."),
  body("age").trim().optional().isNumeric().withMessage("Age is required."),
  body("address")
    .trim()
    .optional()
    .isLength({ min: 6, max: 60 })
    .withMessage("Address must be between 6 to 60 characters."),
];

exports.CreatePostValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 70 })
    .withMessage("title must be between 5 to 70 characters."),
  body("content")
    .trim()
    .isLength({ min: 5, max: 70 })
    .withMessage("content must be between 5 to 70 characters."),
  body("description")
    .trim()
    .isLength({ min: 5, max: 70 })
    .withMessage("description must be between 5 to 70 characters."),
];

exports.UpdatePostValidation = [
  body("title")
    .trim()
    .optional()
    .isLength({ min: 5, max: 70 })
    .withMessage("title must be between 5 to 70 characters."),
  body("content")
    .trim()
    .optional()
    .isLength({ min: 5, max: 70 })
    .withMessage("content must be between 5 to 70 characters."),
  body("description")
    .trim()
    .optional()
    .isLength({ min: 5, max: 70 })
    .withMessage("description must be between 5 to 70 characters."),
];
