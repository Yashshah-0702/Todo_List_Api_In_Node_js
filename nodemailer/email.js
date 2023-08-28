const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yash72200002@gmail.com",
    pass: "xszbemuusaprolkp",
  },
});

module.exports.sendNewTaskEmail = (userEmail, post) => {
  transporter.sendMail({
    from: "yash72200002@gmail.com",
    to: userEmail,
    subject: "New Task Added",
    html: `<h1>New task is added</h1>
      <h3>Summary of Added Task:-</h3>
      <p>Title:- ${post.title}</p>
      <p>Content:- ${post.content}</p>
      <p>UploadedFilePath:- ${post.uploads}</p>
      <p>Description:- ${post.description}</p>`,
  });
};

module.exports.signUpMail = (userEmail) => {
  transporter.sendMail({
    from: "yash72200002@gmail.com",
    to: userEmail,
    subject: "Sign-Up Succeded",
    html: `<h1>Congratulations, Your Profile Added...</h1>
        <h2>You are successfully logged in....</h2> `,
  });
};
