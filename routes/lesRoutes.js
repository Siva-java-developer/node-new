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

// ✅ Apply auth middleware to all routes below
router.use(auth);

// All routes below require valid JWT
router.post('/lessons', createLessonsForCourse);
router.get('/lessons', getAllLessons);
router.get('/lessons/:lessonsId', getLessonsById);
router.put('/lessons/:lessonsId', updateLessons);
router.delete('/lessons/:lessonsId', deleteLessons);
router.get('/lessons/course/:courseId', getAllLessonsByCourse);

module.exports = router;
