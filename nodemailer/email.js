const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yash72200002@gmail.com",
    pass: "xszbemuusaprolkp",
  },
});

module.exports.sendNewTaskEmail = (userEmail, task) => {
  transporter.sendMail({
    from: "yash72200002@gmail.com",
    to: userEmail,
    subject: "New Task Added",
    html: `<h1>New task is added</h1>
      <h3>Summary of Added Task:-</h3>
      <p>Title:- ${task.title}</p>
      <p>Content:- ${task.content}</p>
      <p>UploadedFilePath:- ${task.uploads}</p>
      <p>Description:- ${task.description}</p>`,
  });
};

module.exports.signUpMail = (userEmail) => {
  transporter.sendMail({
    from: "yash72200002@gmail.com",
    to: userEmail,
    subject: "Sign-Up Succeded",
    html: `<h1>Congratulations, Your Profile Added...</h1>
        <h2>Your Sign-Up has succesfully done....</h2> `,
  });
};
