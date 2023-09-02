const Todo = require("../Model/todo");

const User = require("../Model/user");

const clearUploads = require("../Utils/clearUploads");

const emailTemplate = require("../Nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../Utils/error");

const messages = require("../Utils/messages");

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
        status: "True",
        message: messages.SUCCESS.message,
        tasks: result,
        statusCode: messages.SUCCESS.statuscode,
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
    errorHandling.validationErrors(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode,
      errors
    );
  }
  if (!req.file) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY_IMAGE.message,
      messages.UNPROCESSABLE_ENTITY_IMAGE.statuscode
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
          messages.UNPROCESSABLE_ENTITY_SHARP.message,
          messages.UNPROCESSABLE_ENTITY_SHARP.statuscode
        );
      } else {
        fs.unlinkSync(uploads);
        fs.renameSync(resizedTempPath, uploads);
        todo
          .save()
          .then((result) => {
            task = result;
            return res.status(messages.CREATED.statuscode).json({
              status: "True",
              message: messages.CREATED.message,
              task: result,
              statusCode: messages.CREATED.statuscode,
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
      }
    });
};

exports.getSingleTask = (req, res, next) => {
  const tasksId = req.params.tasksId;
  Todo.findById(tasksId)
    .then((task) => {
      if (!task) {
        errorHandling.error(
          messages.NOT_FOUND_TASK.message,
          messages.NOT_FOUND_TASK.statuscode
        );
      }
      return res.status(messages.SUCCESS.statuscode).json({
        status: "True",
        message: messages.SUCCESS.message,
        task: task,
        statusCode: messages.SUCCESS.statuscode,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.updateTasks = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.validationErrors(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode,
      errors
    );
  }
  const tasksId = req.params.tasksId;
  const compressionQuality = 80;
  const title = req.body.title;
  const content = req.body.content;
  let uploads = req.body.uploads;
  const description = req.body.description;
  const resizedTempPath = path.join("uploads", "temp", req.file.filename);
  if (req.file) {
    uploads = req.file.path;
  }
  sharp(uploads)
    .jpeg({ quality: compressionQuality })
    .toFile(resizedTempPath, (err, info) => {
      if (err) {
        errorHandling.error(
          messages.UNPROCESSABLE_ENTITY_SHARP.message,
          messages.UNPROCESSABLE_ENTITY_SHARP.statuscode
        );
      } else {
        fs.unlinkSync(uploads);
        fs.renameSync(resizedTempPath, uploads);
      }
    });
  Todo.findById(tasksId)
    .then((task) => {
      if (!task) {
        errorHandling.error(
          messages.NOT_FOUND_TASK.message,
          messages.NOT_FOUND_TASK.statuscode
        );
      }
      if (task.userId.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode
        );
      }
      if (title !== undefined) {
        task.title = title;
      }
      if (content !== undefined) {
        task.content = content;
      }
      if (uploads !== undefined) {
        if (uploads !== task.uploads) {
          clearUploads(task.uploads);
        }
        task.uploads = uploads;
      }
      if (description !== undefined) {
        task.description = description;
      }
      return task.save();
    })
    .then((result) => {
      return res.status(messages.SUCCESS.statuscode).json({
        status: "True",
        message: messages.SUCCESS.message,
        task: result,
        statusCode: messages.SUCCESS.statuscode,
      });
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
          messages.NOT_FOUND_TASK.message,
          messages.NOT_FOUND_TASK.statuscode
        );
      }
      if (task.userId.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode
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
      return res.status(messages.SUCCESS.statuscode).json({
        status: "True",
        message: messages.SUCCESS.message,
        statusCode: messages.SUCCESS.statuscode,
        statusCode: messages.SUCCESS.statuscode,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};
