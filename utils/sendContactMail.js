const nodemailer = require("nodemailer");

const sendContactMail = async (email, contactNumber, description, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = "Skill Up Tech Solutions - New Contact Form Submission";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 2px solid #e5e7eb;">
          <tr>
            <td style="text-align: center; vertical-align: middle;">
              <div style="color: white; padding: 15px 25px; border-radius: 8px; display: inline-block; margin-bottom: 15px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #f57f17;">New Contact Form Submission</h1>
              </div>
            </td>
            <td style="text-align: right; vertical-align: top; width: 80px;">
              <img src="https://frontend-admin-panel-ecru.vercel.app/assets/newlogo-CpmjAHNb.png" alt="Skill Up Tech Logo" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">            
            </td>
          </tr>
        </table>
        
        <h2 style="color: #f57f17; margin-bottom: 20px;">Contact Details</h2>
        <div style="margin-bottom: 20px;">
          <strong style="color: #374151;">Name:</strong>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #f57f17;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${name}</p>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Email:</strong>
            <span style="color: #6b7280; margin-left: 10px;">${email}</span>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <strong style="color: #374151;">Contact Number:</strong>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #f57f17;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${contactNumber}</p>
          </div>
        </div>
        
        ${description ? `
        <div style="margin-bottom: 20px;">
          <strong style="color: #374151;">Description:</strong>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 10px; border-left: 4px solid #f57f17;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">${description}</p>
          </div>
        </div>
        ` : ''}
        
        <div style="background-color: #eff6ff; border-left: 4px solid #f79b4aff; padding: 15px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #f57f17; font-weight: bold;">Contact Information:</p>
          <ul style="margin: 10px 0 0 0; color: #f57f17;">
            <li>Submitted on: <strong>${new Date().toLocaleString()}</strong></li>
            <li>Please respond to the customer at: <strong>${email}</strong></li>
          </ul>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <div style="text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            This is an automated message from <strong>Skill Up Tech Solutions</strong>
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
    from: `"Skill Up Tech Solutions" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject,
    html,
    replyTo: email, // This allows admin to reply directly to the customer
  });
};

module.exports = { sendContactMail };