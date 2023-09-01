const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    reqired: true,
  },
  password: {
    type: String,
    required: true,
  },
  todoTasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Todo",
    },
  ],
  sharingHistory: [
    {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo", 
      },
      sharedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
