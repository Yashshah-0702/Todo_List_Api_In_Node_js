const Todo = require("../Model/todo");

const User = require("../Model/user");

const clearUploads = require("../middleware/clearUploads");

const emailTemplate = require("../nodemailer/email");

const { validationResult } = require("express-validator");

const errorHandling = require("../Error_handling/error");

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
      errorHandling.error500(err);
    });
};

exports.createPosts = (req, res, next) => {
  let post;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error("Creating post failed...", 422);
  }
  if (!req.file) {
    errorHandling.error("No image found...", 404);
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
      return emailTemplate.sendNewTaskEmail(user.email, post);
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};

exports.getSinglePost = (req, res, next) => {
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error("Post not found", 404);
      }
      return res.status(200).json({
        status: "true",
        message: "Post Founded Successfully",
        post: post,
        statusCode: 200,
      });
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};

exports.updatePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error("Updating post failed...", 422);
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
    errorHandling.error("No file picked...", 422);
  }
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error("Post not found...", 404);
      }
      if (post.userId.toString() !== req.userId) {
        errorHandling.error("Not Authorised", 403);
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
        .status(201)
        .json({ message: "Post updated successfully", post: result });
    })
    .catch((err) => {
      errorHandling.error500(err);
    });
};

exports.deletePosts = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorHandling.error("Deleting post failed...", 404);
  }
  const postsId = req.params.postsId;
  Todo.findById(postsId)
    .then((post) => {
      if (!post) {
        errorHandling.error("post not found...", 404);
      }
      if (post.userId.toString() !== req.userId) {
        errorHandling.error("Not authorised", 404);
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
        .status(200)
        .json({ status: "true", message: "Post Deleted Successfully" });
    })
    .catch((err) => {
      errorHandling.error500(err)
    });
};
