const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { careerApplicationSubmission, careerApplicationWithAttachment } = require('../controllers/careerApplicationController');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow PDF and DOC files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume uploads'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

/**
 * @swagger
 * /api/career-mail:
 *   get:
 *     summary: Submit a career application via GET request (no attachment)
 *     tags: 
 *        - Career Applications
 *     parameters:
 *       - in: query
 *         name: name
 *         type: string
 *         required: true
 *         description: Candidate's full name
 *       - in: query
 *         name: email
 *         type: string
 *         required: true
 *         description: Candidate's email address
 *       - in: query
 *         name: mobile
 *         type: string
 *         required: true
 *         description: Candidate's mobile number
 *       - in: query
 *         name: title
 *         type: string
 *         required: true
 *         description: Job title/position applying for
 *     responses:
 *       200:
 *         description: Career application email sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get('/career-mail', careerApplicationSubmission);

/**
 * @swagger
 * /api/career-mail:
 *   post:
 *     summary: Submit a career application with resume attachment
 *     tags: 
 *        - Career Applications
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: Candidate's full name
 *       - in: formData
 *         name: email
 *         type: string
 *         required: true
 *         description: Candidate's email address
 *       - in: formData
 *         name: mobile
 *         type: string
 *         required: true
 *         description: Candidate's mobile number
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: Job title/position applying for
 *       - in: formData
 *         name: resume
 *         type: file
 *         required: true
 *         description: Resume file (PDF, DOC, DOCX - max 10MB)
 *     responses:
 *       200:
 *         description: Career application with attachment sent successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/career-mail', upload.single('resume'), careerApplicationWithAttachment);

module.exports = router;