const Todo = require("../Model/todo");

const User = require("../Model/user");

const clearUploads = require("../utils/clearUploads");

const emailTemplate = require("../nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../Error_handling/error");

const statusCodes = require("../Error_handling/statusCodes");

const errorMessages = require("../Error_handling/errorMessages");

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
      return res.status(200).json({
        meta: {
          message: "All Posts Found",
          posts: result,
          statusCode: 200,
        },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.createPosts = (req, res, next) => {
  let post;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      "Creating post failed...",
      statusCodes.UNPROCESSABLE_ENTITY
    );
  }
  if (!req.file) {
    errorHandling.error("No image found...", statusCodes.UNPROCESSABLE_ENTITY);
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
         errorHandling.error("image not suitable",statusCodes.UNPROCESSABLE_ENTITY)
      } else {
        fs.unlinkSync(uploads);
        fs.renameSync(resizedTempPath, uploads);
      }
    });
  todo
    .save()
    .then((result) => {
      post = result;
      return res.status(statusCodes.CREATED).json({
        message: "Post Created Succesfully",
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
        err.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error("Post not found", statusCodes.NOT_FOUND);
      }
      return res.status(statusCodes.SUCCESS).json({
        message: "Post Founded Successfully",
        post: post,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};
1;

exports.updatePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error(
      "Updating post failed...",
      statusCodes.UNPROCESSABLE_ENTITY
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
    errorHandling.error("No file picked...", statusCodes.UNPROCESSABLE_ENTITY);
  }
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error("Post not found...", statusCodes.NOT_FOUND);
      }
      if (post.userId.toString() !== req.userId) {
        errorHandling.error("Not Authorised", statusCodes.FORBIDDEN);
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
        .status(statusCodes.SUCCESS)
        .json({ message: "Post updated successfully", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
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
          "post not found...",
          statusCodes.UNPROCESSABLE_ENTITY
        );
      }
      if (post.userId.toString() !== req.userId) {
        errorHandling.error("Not authorised", statusCodes.FORBIDDEN);
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
        .status(statusCodes.SUCCESS)
        .json({ message: "Post Deleted Successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = statusCodes.INTERNAL_SERVER_ERROR;
      }
      next(err);
    });
};
