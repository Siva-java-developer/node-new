const express = require("express");
const { contactUs } = require("../controllers/contactController");

const router = express.Router();

// POST /api/contact - Contact Us form submission
router.post("/contact", contactUs);

module.exports = router;