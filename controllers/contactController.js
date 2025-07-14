const { sendContactMail } = require("../utils/sendContactMail");

// Contact Us API
const contactUs = async (req, res) => {
  try {
    const { email, contactNumber, description } = req.body;

    // Validate required fields (email and contactNumber only)
    if (!email || !contactNumber) {
      return res.status(400).json({ 
        message: "email field is required" 
      });
    }
    if (!email || !contactNumber) {
      return res.status(400).json({ 
        message: "contactNumber field is required" 
      });
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Validate contactNumber field length
    if (contactNumber.trim().length < 10) {
      return res.status(400).json({ 
        message: "Contact number must be at least 10 characters long" 
      });
    }

    if (contactNumber.length > 15) {
      return res.status(400).json({ 
        message: "Contact number must be less than 15 characters" 
      });
    }

    // Validate description field (optional - only if provided)
    if (description && description.trim().length > 0) {
      if (description.trim().length < 10) {
        return res.status(400).json({ 
          message: "Description must be at least 10 characters long" 
        });
      }

      if (description.length > 1000) {
        return res.status(400).json({ 
          message: "Description must be less than 1000 characters" 
        });
      }
    }

    // Send email to admin
    await sendContactMail(email, contactNumber.trim(), description ? description.trim() : null);

    // Success response
    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We have received your message and will get back to you soon."
    });

  } catch (error) {
    console.error("Contact form error:", error);
    
    // Handle specific email errors
    if (error.code === 'EAUTH' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        message: "Email service is currently unavailable. Please try again later."
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

module.exports = {
  contactUs
};