const nodemailer = require("nodemailer");

const sendOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = "Packaging Repository Tool - OTP Verification";

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #16a34a;">Packaging Repository Tool</h2>
      <p>Dear User,</p>
      <p>Your One Time Password (OTP) is:</p>
      <div style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #000;">
        ${otp}
      </div>
      <p>This OTP is valid for <strong>1 minute</strong> only.</p>
      <p>If you did not request this, please ignore the email.</p>
      <br/>
      <p>Thanks,<br/>Packaging Repository Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Packaging Repository Tool" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendOtpEmail;
