module.exports = {
  CREATED: { statuscode: 201, message: "Succesfully Created" },
  SUCCESS: { statuscode: 200, message: "Successfully action done" },
  UNPROCESSABLE_ENTITY: {
    statuscode: 422,
    message: "Check your data, Unprocessable entity",
  },
  NOT_FOUND: { statuscode: 404, message: "Not found..." },
  FORBIDDEN: {
    statuscode: 403,
    message: "You dont have access for this action, unauthorised access",
  },
  UNAUTHORISED_TODO: {
    statuscode: 401,
    message: "Please login or sign up for this action , unauthorised access",
  },
  UNAUTHORISED_EMAIL: {
    statuscode: 401,
    message: "Invalid emailID or user does not exists",
  },
  UNAUTHORISED_PASS: {
    statuscode: 401,
    message: "Incorrect password , please type correct password",
  },
  INTERNAL_SERVER_ERROR: 500,
};
