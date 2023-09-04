module.exports = {
  CREATED: { statuscode: 201, message: "Succesfully Created" },
  SUCCESS: { statuscode: 200, message: "Successfully action done" },
  UNPROCESSABLE_ENTITY: {
    statuscode: 422,
    message: "Check your data, Unprocessable entity",
  },  UNPROCESSABLE_ENTITY_SHARP: {
    statuscode: 422,
    message: "Check your upload file extension, Unprocessable entity",
  },
  UNPROCESSABLE_ENTITY_IMAGE: {
    statuscode: 422,
    message: "Please check input field or your upload file is missing ",
  },
  NOT_FOUND: { statuscode: 404, message: "User not found, please check userId" },
  NOT_FOUND_TASK: { statuscode: 404, message: "Task not found, please check taskId" },
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
    message: "Please check input field or Invalid emailID or user does not exists",
  },
  UNAUTHORISED_PASS: {
    statuscode: 401,
    message: "Please check input field or Incorrect password , please type correct password",
  },
  INTERNAL_SERVER_ERROR: 500,
};
