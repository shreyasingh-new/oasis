const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  loginAdmin,
  getAdminProfile,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  getDashboardStats,
  getPlatformStatistics,
  getActivityLogs,
} = require('../controllers/adminController');

// Public Admin Login Route
router.post('/login', loginAdmin);

// All subsequent routes require authentication & role: 'admin'
router.use(protect);
router.use(authorize('admin'));

router.get('/profile', getAdminProfile);

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/statistics', getPlatformStatistics);
router.get('/activity', getActivityLogs);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Event Management
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/participants', getEventParticipants);

module.exports = router;
