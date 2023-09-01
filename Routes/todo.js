const express = require("express");

const todoController = require("../Controller/todo");

const isAuth = require("../middleware/is-Auth");

const isValidation = require("../middleware/is-validation");

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

router.post('/share-task/:tasksId',isAuth,todoController.ShareTask)

module.exports = router;1
