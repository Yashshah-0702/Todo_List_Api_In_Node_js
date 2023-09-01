const express = require("express");

const todoController = require("../Controller/todo");

const isAuth = require("../Middleware/is-Auth");

const isValidation = require("../Middleware/is-validation");

const router = express.Router();

router.get("/task", isAuth, todoController.getTasks);

router.post(
  "/task",
  isAuth,
  isValidation.CreatePostValidation,
  todoController.createTasks
);

router.get("/task/:tasksId", isAuth, todoController.getSingleTask);

router.put(
  "/task/:tasksId",
  isAuth,
  isValidation.UpdatePostValidation,
  todoController.updateTasks
);

router.delete("/task/:tasksId", isAuth, todoController.deleteTasks);

module.exports = router;
