const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <-- your auth middleware

const {
  createLessonsForCourse,
  getAllLessons,
  getLessonsById,
  updateLessons,
  deleteLessons,
  getAllLessonsByCourse,
} = require('../controllers/lessonsController');

// Protected routes (require authentication)
router.post('/lessons', auth, createLessonsForCourse);
router.put('/lessons/:lessonsId', auth, updateLessons);
router.delete('/lessons/:lessonsId', auth, deleteLessons);

// Public GET routes (no authentication required)
router.get('/lessons', getAllLessons);
router.get('/lessons/:lessonsId', getLessonsById);
router.get('/lessons/course/:courseId', getAllLessonsByCourse);

module.exports = router;
