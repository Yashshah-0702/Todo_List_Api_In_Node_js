const path = require("path");

const Todo = require("../Model/todo");

const User = require("../Model/user");

const nodemailer = require("nodemailer");

const fs = require("fs");

const { validationResult } = require("express-validator");
const { post } = require("../Routes/todo");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yash72200002@gmail.com",
    pass: "xszbemuusaprolkp",
  },
});

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
    const error = new Error("Creating post failed...");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image found...!");
    error.statusCode = 404;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const imageurl = req.file.path;
  const description = req.body.description;
  const todo = new Todo({
    title: title,
    content: content,
    imageurl: imageurl,
    description: description,
    userId: req.userId,
  });
  todo
    .save()
    .then((result) => {
      post = result
      res.status(201).json({
        status: "true",
        message: "Post Created Succesfully",
        post: result,
      });
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      transporter.sendMail({
        from: "yash72200002@gmail.com",
        to: user.email,
        subject: "New Task Added",
        html: `<h1>New task is added</h1>
        <h3>Summary of Added Task:-</h3>
        <p>Title:-${post.title}</p>
        <p>Content:-${post.content}</p>
        <p>ImagePath:-${post.imageurl}</p>
        <p>Description:-${post.description}</p>`,
      });
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
  let imageurl = req.body.image;
  const description = req.body.description;
  if (req.file) {
    imageurl = req.file.path;
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

      clearImage(post.imageurl);

      post.title = title;
      post.content = content;
      post.imageurl = imageurl;
      post.description = description;
      return post.save();
    })
    .then((result) => {
      return res
        .status(201)
        .json({ message: "Post updated successfully", post: result });
    })
    .catch((err) => {
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

      clearImage(post.imageurl);
      return Todo.findByIdAndRemove(postsId);
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
