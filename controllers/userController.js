const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendOtpEmail = require("../utils/sendOtpMail");
const sendPasswordMail = require("../utils/sendPasswordMail");
const { sendResetPasswordMail } = require("../utils/sendResetMail");

const otpStore = new Map(); 

exports.register = async (req, res) => {
  const { name, email, mobile } = req.body;

  if (!name || !email || !mobile) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (name.length < 3) {
    return res.status(400).json({ message: "Name must be at least 3 characters long" });
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return res.status(400).json({ message: "Invalid Email Address" });
  }

  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Mobile number must be exactly 10 digits" });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 60 * 1000; // 1 minute expiry

    otpStore.set(email, { name, email, mobile, otp, expiresAt });

    console.log("Generated OTP:", otp);
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ---- 
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: "OTP not found" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }
  if (parseInt(otp) !== record.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const randomPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  const user = await User.create({
    name: record.name,
    email: record.email,
    mobile: record.mobile,
    password: hashedPassword,
    status: "Active",
    role:"user",
  });
  await sendPasswordMail(email, record.name, randomPassword);
  otpStore.delete(email);
  res.status(201).json({ message: "User registered and password sent to email" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ email: user.email, name: user.name,id:user._id,role:user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
      
    });
    res.json({ token:token, user:{name:user.name,email:user.email,role:user.role,status:user.status} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== FORGOT PASSWORD API =====
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    return res.status(400).json({ message: "Invalid Email Address" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate reset token (encrypt the email with timestamp for security)
    const resetData = `${email}-${Date.now()}`;
    const resetToken = Buffer.from(resetData).toString('base64');
    console.log("Generated token data:", resetData);
    console.log("Generated token:", resetToken);
    
    // Set expiry time (15 minutes from now)
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Update user with reset token, expiry time, and isForgot flag
    await User.findByIdAndUpdate(user._id, {
      resetPasswordExpires: resetTokenExpiry,
      isForgot: true
    });
    
    // Create reset link pointing to your frontend
    const frontendResetUrl = `${"https://frontend-admin-panel-ecru.vercel.app/#/reset-password"}?token=${resetToken}`;

    // Send email with reset link
    await sendResetPasswordMail(user.email, user.name, frontendResetUrl);

    res.status(200).json({ 
      message: "Password reset link sent to your email"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password with Token
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    let email;
    try {
      const decodedData = Buffer.from(token, 'base64').toString('utf-8');
      email = decodedData.split('-')[0]; 
    } catch (error) {
      return res.status(400).json({ message: "Invalid token format" });
    }
    const user = await User.findOne({ 
      email: email,
      isForgot: true,
      resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token" 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: undefined, 
      resetPasswordExpires: undefined, 
      isForgot: false,
      updatedAt: new Date()
    });

    res.status(200).json({ 
      message: "Password reset successfully" 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = resetPassword;