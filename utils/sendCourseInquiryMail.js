const nodemailer = require("nodemailer");

const sendCourseInquiryMail = async (name, email, mobile, courseName, attachmentPath = null) => {
  console.log('Sending course inquiry mail with params:', { name, email, mobile, courseName, attachmentPath });
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = "Skill Up Tech Solutions - New Course Inquiry";
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 650px; margin: 0 auto; background-color: #f8fafc;">
      <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 4px solid #f57f17;">
        
        <!-- Header Section -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 35px; padding-bottom: 25px; border-bottom: 2px solid #e5e7eb;">
          <tr>
            <td style="text-align: center; vertical-align: middle;">
              <div style=color: white; padding: 15px 25px; border-radius: 8px; display: inline-block; margin-bottom: 15px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;color: #f57f17;">New Course Inquiry</h1>
              </div>
              <p style="color: #6b7280; margin: 0; font-size: 16px;">A new student is interested in our courses</p>
            </td>
            <td style="text-align: right; vertical-align: top; width: 80px;">
              <img src="https://frontend-admin-panel-ecru.vercel.app/assets/newlogo-CpmjAHNb.png" alt="Skill Up Tech Logo" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">            
            </td>
          </tr>
        </table>
        
        <!-- Student Information Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
            <span style="background-color: #f57f17; color: #f57f17; padding: 8px; border-radius: 50%; margin-right: 12px; font-size: 16px;"></span>
            Student Information
          </h2>
          
          <div style="background-color: #f9fafb; padding: 25px; border-radius: 10px; border-left: 4px solid #f57f17;">
            <div style="display: grid; gap: 18px;">
              
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="background-color: ##dbeafe; color: #f57f17; padding: 8px; border-radius: 6px; margin-right: 15px; font-size: 14px; min-width: 35px; text-align: center;">
                  
                </div>
                <div>
                  <strong style="color: #000000ff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</strong>
                  <div style="color: #000000ff; font-size: 16px; font-weight: 500; margin-top: 4px;">${name}</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="background-color: ##dbeafe; color: #f57f17; padding: 8px; border-radius: 6px; margin-right: 15px; font-size: 14px; min-width: 35px; text-align: center;">
                  
                </div>
                <div>
                  <strong style="color: #000000ff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</strong>
                  <div style="color: #374151; font-size: 16px; font-weight: 500; margin-top: 4px;">
                    <a href="mailto:${email}" style="color: #000000ff; text-decoration: none;">${email}</a>
                  </div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; padding: 12px 0;">
                <div style="background-color: ##dbeafe; color: #d97706; padding: 8px; border-radius: 6px; margin-right: 15px; font-size: 14px; min-width: 35px; text-align: center;">
                  
                </div>
                <div>
                  <strong style="color: #000000ff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Mobile Number</strong>
                  <div style="color: #1f2937; font-size: 16px; font-weight: 500; margin-top: 4px;">
                    <a href="tel:${mobile}" style="color: #000000ff; text-decoration: none;">${mobile}</a>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
        
        <!-- Course Information Section -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
            <span style="background-color: #fef3c7; color: #f57f17; padding: 8px; border-radius: 50%; margin-right: 12px; font-size: 16px;"></span>
            Course Interest
          </h2>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 10px; border-left: 4px solid #f57f17;">
            <div style="text-align: center;">
              <div style="background: linear-gradient(135deg, #f57f17 0%, #f57f17 100%); color: white; padding: 15px 25px; border-radius: 8px; display: inline-block;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${courseName}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Required Section -->
        <div style="background-color: #eff6ff; border-left: 4px solid #f57f17; padding: 20px; margin: 30px 0; border-radius: 8px;">
          <div style="display: flex; align-items: flex-start;">
            <div style="background-color: #f57f17; color: white; padding: 8px; border-radius: 50%; margin-right: 15px; font-size: 16px; min-width: 35px; text-align: center;">
              
            </div>
            <div>
              <h3 style="margin: 0 0 10px 0; color: #000000ff; font-size: 16px; font-weight: 600;">Action Required</h3>
              <ul style="margin: 0; color: #000000ff; line-height: 1.6; padding-left: 20px;">
                <li><strong>Follow up with the student</strong> within 24 hours</li>
                <li><strong>Contact via:</strong> ${email} or ${mobile}</li>
                <li><strong>Course:</strong> ${courseName}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
            <a href="mailto:${email}" style="background-color: #f57f17; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 8px;">
            Reply via Email
            </a>
            <a href="tel:${mobile}" style="background-color: #f57f17; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 8px;">
            Call Student
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center; padding-top: 20px;">
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0; font-weight: 500;">
            <strong>Skill Up Tech Solutions</strong>
            </p>
            <p style="color: #000000ff; font-size: 12px; margin: 5px 0 0 0;">
              Course Inquiry Management System
            </p>
          </div>
          
          <p style="color: #000000ff; font-size: 11px; margin: 0; line-height: 1.4;">
            This email was automatically generated when a student submitted a course inquiry form.<br>
            Please respond promptly to maintain high customer satisfaction.
          </p>
        </div>
        
      </div>
    </div>
  `;

  // Send to admin email
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Skill Up Tech Solutions" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject,
    html,
    replyTo: email, // This allows admin to reply directly to the student
  };

  // Add attachment if provided
  if (attachmentPath) {
    const path = require('path');
    mailOptions.attachments = [
      {
        filename: path.basename(attachmentPath), // Get filename from path (works on both Windows and Unix)
        path: attachmentPath
      }
    ];
  }

  console.log('Sending email with options:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    hasAttachment: !!mailOptions.attachments
  });
  
  await transporter.sendMail(mailOptions);
  console.log('Email sent successfully!');
};

module.exports = { sendCourseInquiryMail };