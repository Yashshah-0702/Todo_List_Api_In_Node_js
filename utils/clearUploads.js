const fs = require("fs");

const path = require("path");

const clearUploads = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

module.exports = clearUploads;
