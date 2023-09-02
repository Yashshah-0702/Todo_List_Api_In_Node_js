exports.errorHandling = (error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
      status: "false",
      message: message,
      data: data,
      statusCode: status,
  });
};

exports.error = (message, status) => {
  const error = new Error(message);
  error.statusCode = status;
  throw error;
};

exports.validationErrors = (message,status,errors)=>{
  const error = new Error(message);
  error.statusCode = status;
  error.data = errors.array().map((error) => error.msg);
  throw error;
}