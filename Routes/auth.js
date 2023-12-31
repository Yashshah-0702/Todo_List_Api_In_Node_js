const express = require("express");

const router = express.Router();

const AuthController = require("../Controller/auth");

const isValidation = require("../Middleware/is-validation");

const isAuth = require("../Middleware/is-Auth");

router.put("/signup", isValidation.SignupValidation, AuthController.SignUp);

router.post("/login", isValidation.Login,AuthController.Login);

router.get("/login/:userId", isAuth, AuthController.getSingleUser);

router.put(
  "/login/:userId",
  isAuth,
  isValidation.UpdateUserValidation,
  AuthController.updateUser
);

router.delete("/login/:userId", isAuth, AuthController.deleteUser);

module.exports = router;
