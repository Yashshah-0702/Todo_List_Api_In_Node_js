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
  todoTasks:[
    {
       type:Schema.Types.ObjectId,
       ref:'Todo'      
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
