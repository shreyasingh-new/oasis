const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const {
  registerForEvent,
  cancelRegistration,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to browse events & Organizer route to create events
router
  .route('/')
  .get(getEvents)
  .post(protect, authorize('organizer'), createEvent);

// Public route to view details & Organizer routes to update/delete events
router
  .route('/:id')
  .get(getEventById)
  .put(protect, authorize('organizer'), updateEvent)
  .delete(protect, authorize('organizer'), deleteEvent);

// Student registration and cancellation routes
router
  .route('/:id/register')
  .post(protect, authorize('student'), registerForEvent)
  .delete(protect, authorize('student'), cancelRegistration);

module.exports = router;
