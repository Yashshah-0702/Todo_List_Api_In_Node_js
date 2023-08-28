exports.errorHandling = (error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    meta: {
      status: "false",
      message: message,
      data: data,
      statusCode: status,
    },
  });
};

exports.error = (message,status)=>{
   const error = new Error(message)
   error.statusCode = status
   throw error
}

exports.error500=(err)=>{
   if(!err.statusCode){
    err.statusCode=500
   }
   next(err)
}

