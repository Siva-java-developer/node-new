const nodemailer = require("nodemailer");

const sendPasswordMail = async (to, name, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = "Your Account Password - Packaging Repository Tool";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #16a34a;">Welcome to Packaging Repository Tool</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your account has been created successfully.</p>
      <p>Your generated password is:</p>
      <div style="font-size: 20px; font-weight: bold;">${password}</div>
      <p>Please use this to login and change it after login.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Packaging Repository Tool" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendPasswordMail;
