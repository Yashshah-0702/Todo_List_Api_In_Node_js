const Todo = require("../Model/todo");

const User = require("../Model/user");

const clearUploads = require("../utils/clearUploads");

const emailTemplate = require("../nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../Error_handling/error");

const messages = require("../Error_handling/Messages");

const sharp = require("sharp");

const path = require("path");

const fs = require("fs");

exports.getPosts = (req, res, next) => {
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
          posts: result,
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

exports.createPosts = (req, res, next) => {
  let post;
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
      post = result;
      return res.status(messages.CREATED.statuscode).json({
        message: messages.CREATED.message,
        post: result,
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
      return emailTemplate.sendNewTaskEmail(user.email, post);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error(
          messages.NOT_FOUND.message,
          messages.NOT_FOUND.statuscode
        );
      }
      return res.status(messages.SUCCESS.statuscode).json({
        message: messages.SUCCESS.message,
        post: post,
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

exports.updatePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      messages.UNPROCESSABLE_ENTITY.message,
      messages.UNPROCESSABLE_ENTITY.statuscode
    );
  }
  const postsId = req.params.postsId;
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
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error(
          messages.NOT_FOUND.message,
          messages.NOT_FOUND.statuscode
        );
      }
      if (post.userId.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode
        );
      }
      if (uploads !== post.uploads) {
        clearUploads(post.uploads);
      }
      post.title = title;
      post.content = content;
      post.uploads = uploads;
      post.description = description;
      return post.save();
    })
    .then((result) => {
      return res
        .status(messages.SUCCESS.statuscode)
        .json({ message: messages.SUCCESS.message, post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = messages.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.deletePosts = (req, res, next) => {
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error(
          messages.UNPROCESSABLE_ENTITY.message,
          messages.UNPROCESSABLE_ENTITY.statuscode
        );
      }
      if (post.userId.toString() !== req.userId) {
        errorHandling.error(
          messages.FORBIDDEN.message,
          messages.FORBIDDEN.statuscode
        );
      }
      clearUploads(post.uploads);
      return Todo.findByIdAndRemove(postsId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todoTasks.pull(postsId);
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
