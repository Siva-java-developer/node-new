const nodemailer = require("nodemailer");

const sendResetPasswordMail = async (to, name, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = "Password Reset Request";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">🔐 Password Reset</h1>
        </div>
        
        <h2 style="color: #dc2626; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi <strong>${name}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We received a request to reset your password for your <strong>Packaging Repository Tool</strong> account.
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Click the button below to reset your password:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${resetLink}" 
             style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
            🔄 Reset My Password
          </a>
        </div>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ Important Security Information:</p>
          <ul style="margin: 10px 0 0 0; color: #991b1b;">
            <li>This link will expire in <strong>15 minutes</strong></li>
            <li>This link can only be used once</li>
            <li>If you didn't request this reset, please ignore this email</li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <div style="text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated message from <strong>Packaging Repository Tool</strong>
          </p>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Packaging Repository Tool" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendResetPasswordMail };