const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getOrganizerDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard endpoints
router.get('/student/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/organizer/dashboard', protect, authorize('organizer'), getOrganizerDashboard);

module.exports = router;
