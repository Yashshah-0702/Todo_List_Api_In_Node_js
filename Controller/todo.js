const path = require("path");

const Todo = require("../Model/todo");

const User = require("../Model/user");

const nodemailer = require("nodemailer");

const fs = require("fs");

const { validationResult } = require("express-validator");

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
        message: "All Posts Found",
        posts: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.createPosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Creating post failed...");
    error.status = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image found...!");
    error.statusCode = 422;
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
        html: "New task is added",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .popul.then((post) => {
      return res.status(200).json({
        status: "true",
        message: "Post Founded Successfully",
        post: post,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updatePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Updating post failed...");
    error.status = 422;
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
        error.status = 404;
        throw error;
      }
      if (post.userId.toString() !== req.userId) {
        const error = new Error("Not Authorised...");
        error.status = 403;
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
      console.log(err);
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
      console.log(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
