const jwt = require("jsonwebtoken");

const errorHandling = require("../utils/error");

const messages = require("../utils/Messages");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    errorHandling.error(
      messages.UNAUTHORISED_TODO.message,
      messages.UNAUTHORISED_TODO.statuscode
    );
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    errorHandling.error(
      messages.UNAUTHORISED_TODO.message,
      messages.UNAUTHORISED_TODO.statuscode
    );
  }
  req.userId = decodedToken.userId;
  next();
};
