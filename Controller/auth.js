const User = require("../Model/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const { validationResult } = require("express-validator");

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
    const error = new Error("signup failed...");
    error.status = 422;
    error.data = errors.array();
    throw error;
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
        .json({ message: "User Created Successfully", user: result._id });
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
      console.log(err);
    });
};

exports.Login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadeduser;
  User.findOne({ email: email })
    .then((user) => {
      loadeduser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((IsEqual) => {
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
      console.log(err);
    });
};
