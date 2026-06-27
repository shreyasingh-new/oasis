const express = require('express');
const router = express.Router();
const {
  getEventParticipants,
  markAttendance,
  associateCertificate,
} = require('../controllers/organizerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Organizer operations
router.get('/events/:id/participants', protect, authorize('organizer'), getEventParticipants);
router.put('/attendance', protect, authorize('organizer'), markAttendance);
router.post('/upload-certificate', protect, authorize('organizer'), upload.single('certificate'), associateCertificate);

module.exports = router;
