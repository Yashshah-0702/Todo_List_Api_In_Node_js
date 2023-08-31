const express = require("express");

const router = express.Router();

const AuthController = require("../Controller/auth");

const isValidation = require("../middleware/is-validation");

const isAuth = require("../middleware/is-Auth");

router.put("/signup", isValidation.SignupValidation, AuthController.SignUp);

router.post("/login", AuthController.Login);

router.get("/login/:userId", isAuth, AuthController.getSingleUser);

router.put(
  "/login/:userId",
  isAuth,
  isValidation.UpdateUserValidation,
  AuthController.updateUser
);

router.delete("/login/:userId", isAuth, AuthController.deleteUser);

module.exports = router;
