const express = require('express');
const router = express.Router();
const {
  getRegisteredEvents,
  getStudentCertificates,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Student-specific pathways
router.get('/events', protect, authorize('student'), getRegisteredEvents);
router.get('/certificates', protect, authorize('student'), getStudentCertificates);

module.exports = router;
