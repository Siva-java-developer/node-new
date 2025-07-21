const express = require("express");
const router = express.Router();
const { register, login, verifyOtp, changePassword, forgotPassword, resetPassword } = require("../controllers/userController");
const auth = require("../middleware/auth");
const User = require("../models/User");
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Create a new user
 *     tags: 
 *        - User
 */
router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/user/change-password", changePassword);

// Forgot Password API
/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Send password reset link to email
 *     tags: 
 *        - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email address of the user
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Reset link sent to email successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset link sent to your email"
 *       400:
 *         description: Invalid email format
 *       404:
 *         description: User not found with this email
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPassword);

// Reset Password API
/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: 
 *        - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456"
 *                 description: Reset token from email
 *               newPassword:
 *                 type: string
 *                 example: "newSecurePassword123"
 *                 description: New password for the user
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post("/reset-password", resetPassword);

// Public GET routes (no authentication required)
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

router.put("/user/:id", auth, async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete("/user/:id", auth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "User deleted" });
});

module.exports = router;
