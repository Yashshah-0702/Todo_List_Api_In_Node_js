const path = require("path");

const Todo = require("../Model/todo");

const User = require("../Model/user");

const nodemailer = require("nodemailer");

const emailTemplate = require('../nodemailer/email')

const fs = require("fs");

const { validationResult } = require("express-validator");
const { errorHandling } = require("../Error_handling/error");

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "yash72200002@gmail.com",
//     pass: "xszbemuusaprolkp",
//   },
// });

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
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPosts = (req, res, next) => {
  let post;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error("Creating post failed...",422)
  }
  if (!req.file) {
    errorHandling.error("No image found...",404)
  }
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
  todo
    .save()
    .then((result) => {
      post = result;
      return res.status(201).json({
        status: "true",
        message: "Post Created Succesfully",
        post: result,
      });
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todoTasks.push(todo);
      return user.save();
    })

    .then((user) => {
      return emailTemplate.sendNewTaskEmail(user.email,post)
      // transporter.sendMail({
      //   from: "yash72200002@gmail.com",
      //   to: user.email,
      //   subject: "New Task Added",
      //   html: `<h1>New task is added</h1>
      //   <h3>Summary of Added Task:-</h3>
      //   <p>Title:-${post.title}</p>
      //   <p>Content:-${post.content}</p>
      //   <p>ImagePath:-${post.uploads}</p>
      //   <p>Description:-${post.description}</p>`,
      // });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post not found");
        error.status = 404;
        throw error;
      }
      return res.status(200).json({
        status: "true",
        message: "Post Founded Successfully",
        post: post,
        statusCode: 200,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Updating post failed...");
    error.statusCode = 422;
    throw error;
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
    const error = new Error("No file picked...");
    error.statusCode = 422;
    throw error;
  }
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post Not Found...");
        error.statusCode = 404;
        throw error;
      }
      if (post.userId.toString() !== req.userId) {
        const error = new Error("Not Authorised...");
        error.statusCode = 403;
        throw error;
      }
      if (uploads !== post.uploads) {
        clearImage(post.uploads);
      }
      post.title = title;
      post.content = content;
      post.uploads = uploads;
      post.description = description;
      return post.save();
    })
    .then((result) => {
      return res
        .status(201)
        .json({ message: "Post updated successfully", post: result });
    })
    .catch((err) => {
      console.log(err)
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Deleting post failed..");
    error.status = 404;
    throw error;
  }
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post not found...");
        error.status = 404;
        throw error;
      }
      if (post.userId.toString() !== req.userId) {
        const error = new Error("Not Authorised...");
        error.status = 403;
        throw error;
      }

      clearImage(post.uploads);
      return Todo.findByIdAndRemove(postsId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.todo.pull(postsId);
      return user.save();
    })
    .then(() => {
      return res
        .status(200)
        .json({ status: "true", message: "Post Deleted Successfully" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
