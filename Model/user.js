const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name:{
   type:String,
   required:true
  },
  age:{
   type:Number,
   required:true
  },
  gender:{
    type:String,
    required:true
  },
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
});

module.exports = mongoose.model("User", userSchema);
