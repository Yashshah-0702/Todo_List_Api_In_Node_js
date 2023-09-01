const Todo = require("../Model/todo");

const User = require("../Model/user");

const clearUploads = require("../utils/clearUploads");

const emailTemplate = require("../nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../utils/error");

const messages = require("../utils/Messages");

const sharp = require("sharp");

const path = require("path");

const fs = require("fs");

exports.getTasks = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  const titleQuery = req.query.title;
  const sortBy = req.query.sortBy || "createdAt";
  const filter = {};
  if (titleQuery) {
    filter.title = { $regex: titleQuery, $options: "i" };
  }
  Todo.find(filter)
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Todo.find(filter)
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .sort({ [sortBy]: 1 });
    })
    .then((result) => {
      return res.status(messages.SUCCESS.statuscode).json({
        meta: {
          message: messages.SUCCESS.message,
          tasks: result,
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.createTasks = (req, res, next) => {
  let task;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
    );
  }
  if (!req.file) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
    );
  }
  const compressionQuality = 80;
  const title = req.body.title;
  const content = req.body.content;
  const uploads = req.file.path;
  const description = req.body.description;
  const todo = new Todo({
    title: title,
    content: content,
    uploads: uploads,
    description: description,
    userId: req.userId,
  });
  const resizedTempPath = path.join("uploads", "temp", req.file.filename);

  sharp(uploads)
    .jpeg({ quality: compressionQuality })
    .toFile(resizedTempPath, (err, info) => {
      if (err) {
        errorHandling.error(
          messages.UNPROCESSABLE_ENTITY.message,
          messages.UNPROCESSABLE_ENTITY.statuscode
        );
      } else {
        fs.unlinkSync(uploads);
        fs.renameSync(resizedTempPath, uploads);
      }
    });
  todo
    .save()
    .then((result) => {
      task = result;
      return res.status(messages.CREATED.statuscode).json({
        message: messages.CREATED.message,
        task: result,
      });
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todoTasks.push(todo._id);
      return user.save();
    })

    .then((user) => {
      return emailTemplate.sendNewTaskEmail(user.email, task);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.getSingleTask = (req, res, next) => {
  const tasksId = req.params.tasksId;
  Todo.findById(tasksId)
    .then((task) => {
      if (!task) {
        errorHandling.error(
          messages.NOT_FOUND.message,
          messages.NOT_FOUND.statuscode
        );
      }
      return res.status(messages.SUCCESS.statuscode).json({
        message: messages.SUCCESS.message,
        task: task,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};
1;

exports.updateTasks = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
    );
  }
  const tasksId = req.params.tasksId;
  const title = req.body.title;
  const content = req.body.content;
  let uploads = req.body.uploads;
  const description = req.body.description;
  if (req.file) {
    uploads = req.file.path;
  }
  if (!uploads) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
    );
  }
  Todo.findById(tasksId)
    .then((task) => {1
      if (!task) {
        errorHandling.error(
          messages.NOT_FOUND.message,
          messages.NOT_FOUND.statuscode
        );
      }
      if (task.userId.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode
        );
      }
      if (uploads !== task.uploads) {
        clearUploads(task.uploads);
      }
      task.title = title;
      task.content = content;
      task.uploads = uploads;
      task.description = description;
      return task.save();
    })
    .then((result) => {
      return res
        .status(messages.SUCCESS.statuscode)
        .json({ message: messages.SUCCESS.message, task: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.deleteTasks = (req, res, next) => {
  const tasksId = req.params.tasksId;
  Todo.findById(tasksId)
    .then((task) => {
      if (!task) {
        errorHandling.error(
          messages.UNPROCESSABLE_ENTITY.message,
          messages.UNPROCESSABLE_ENTITY.statuscode
        );1
      }
      if (task.userId.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode1111111111
       );
      }
      clearUploads(task.uploads);
      return Todo.findByIdAndRemove(tasksId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todoTasks.pull(tasksId);   
      return user.save();
    })
    .then(() => {
      return res
        .status(messages.SUCCESS.statuscode)
        .json({ message: messages.SUCCESS.message });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};


exports.ShareTask = (req,res,next)=>{
  const taskId = req.params.tasksId
}