const express = require("express");

const todoController = require("../Controller/todo");

const isAuth = require("../middleware/is-Auth");

const isValidation = require("../middleware/is-validation");

const router = express.Router();

router.get("/posts", isAuth, todoController.getPosts);

router.post(
  "/posts",
  isAuth,
  isValidation.CreatePostValidation,
  todoController.createPosts
);

router.get("/posts/:postsId", isAuth, todoController.getSinglePost);

router.put(
  "/posts/:postsId",
  isAuth,
  isValidation.UpdatePostValidation,
  todoController.updatePosts
);

router.delete("/posts/:postsId", isAuth, todoController.deletePosts);

module.exports = router;
