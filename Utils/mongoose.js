const mongoose = require("mongoose");

const connectToDatabase = mongoose.connect(
  "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
  // "mongodb+srv://Yash_Shah:y_a_s_h@cluster0.h0nmwav.mongodb.net/TODO"
);

module.exports = connectToDatabase;
