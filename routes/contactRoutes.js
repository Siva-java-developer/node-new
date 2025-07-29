const express = require("express");
const { contactUs } = require("../controllers/contactController");
const { courseMailSubmission } = require("../controllers/courseMailController");
const uploadPdf = require("../config/multerPdf");

const router = express.Router();

// POST /api/contact - Contact Us form submission
router.post("/contact", contactUs);

// POST /api/course-mail - Course inquiry with PDF attachment
router.post("/course-mail", uploadPdf.single("attachment"), courseMailSubmission);

module.exports = router;