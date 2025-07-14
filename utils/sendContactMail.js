const nodemailer = require("nodemailer");

const sendContactMail = async (email, contactNumber, description) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = "New Contact Form Submission";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">📧 New Contact Form Submission</h1>
        </div>
        
        <h2 style="color: #2563eb; margin-bottom: 20px;">Contact Details</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">📧 Email:</strong>
            <span style="color: #6b7280; margin-left: 10px;">${email}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <strong style="color: #374151;">📞 Contact Number:</strong>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${contactNumber}</p>
          </div>
        </div>
        
        ${description ? `
        <div style="margin-bottom: 20px;">
          <strong style="color: #374151;">💬 Description:</strong>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #16a34a;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${description}</p>
          </div>
        </div>
        ` : ''}
        
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af; font-weight: bold;">ℹ️ Contact Information:</p>
          <ul style="margin: 10px 0 0 0; color: #1e40af;">
            <li>Submitted on: <strong>${new Date().toLocaleString()}</strong></li>
            <li>Please respond to the customer at: <strong>${email}</strong></li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <div style="text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated message from <strong>Packaging Repository Tool</strong>
          </p>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
            Contact Form Submission System
          </p>
        </div>
      </div>
    </div>
  `;

  // Send to admin email (you can set this in environment variables)
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"Packaging Repository Tool" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject,
    html,
    replyTo: email, // This allows admin to reply directly to the customer
  });
};

module.exports = { sendContactMail };