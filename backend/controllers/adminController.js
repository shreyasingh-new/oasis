const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/activityLogger');

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Admin account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Users with search and filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const queryObj = {};

    if (role) {
      queryObj.role = role;
    }

    if (search) {
      queryObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(queryObj).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Get All Users Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user by ID with history
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let createdEvents = [];
    let participationHistory = [];

    if (user.role === 'organizer') {
      createdEvents = await Event.find({ organizer: user._id }).sort({ date: -1 });
    } else if (user.role === 'student') {
      participationHistory = await Registration.find({ student: user._id })
        .populate('event')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: {
        user,
        createdEvents,
        participationHistory,
      },
    });
  } catch (error) {
    console.error('Get User By ID Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User Info
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, department, year, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;
    if (year !== undefined) user.year = year;
    if (role) user.role = role;

    const updatedUser = await user.save();

    logActivity({
      user: req.user._id,
      role: 'admin',
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: updatedUser._id,
      description: `Admin updated profile for user: ${updatedUser.name}`,
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update User Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Activate/Deactivate User Account Status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Please provide isActive as boolean' });
    }

    user.isActive = isActive;
    await user.save();

    logActivity({
      user: req.user._id,
      role: 'admin',
      action: 'USER_STATUS_CHANGE',
      entityType: 'User',
      entityId: user._id,
      description: `Admin ${isActive ? 'activated' : 'deactivated'} user: ${user.name}`,
    });

    res.json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    console.error('Update User Status Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userName = user.name;
    await user.deleteOne();

    logActivity({
      user: req.user._id,
      role: 'admin',
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: req.params.id,
      description: `Admin deleted user: ${userName}`,
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Events for Admin
// @route   GET /api/admin/events
// @access  Private/Admin
const getAllEvents = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const queryObj = {};

    if (category) queryObj.category = category;
    if (status) queryObj.status = status;
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(queryObj)
      .populate('organizer', 'name email department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Admin Get Events Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Event Details for Admin
// @route   GET /api/admin/events/:id
// @access  Private/Admin
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email department');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit any event by Admin
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const fieldsToUpdate = [
      'title',
      'description',
      'category',
      'venue',
      'date',
      'startTime',
      'endTime',
      'registrationDeadline',
      'maxParticipants',
      'banner',
      'status',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const updatedEvent = await event.save();

    logActivity({
      user: req.user._id,
      role: 'admin',
      action: 'UPDATE_EVENT',
      entityType: 'Event',
      entityId: updatedEvent._id,
      description: `Admin updated event: ${updatedEvent.title}`,
    });

    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete any event by Admin
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const eventTitle = event.title;
    await event.deleteOne();

    logActivity({
      user: req.user._id,
      role: 'admin',
      action: 'DELETE_EVENT',
      entityType: 'Event',
      entityId: req.params.id,
      description: `Admin deleted event: ${eventTitle}`,
    });

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Event Participants for Admin
// @route   GET /api/admin/events/:id/participants
// @access  Private/Admin
const getEventParticipants = async (req, res) => {
  try {
    const participants = await Registration.find({ event: req.params.id })
      .populate('student', 'name email department year profileImage')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: participants.length, data: participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Dashboard Overview Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    
    const now = new Date();
    const activeEvents = await Event.countDocuments({ status: 'published' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const upcomingEvents = await Event.countDocuments({ status: 'published', date: { $gt: now } });

    const totalRegistrations = await Registration.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalOrganizers,
        totalEvents,
        activeEvents,
        completedEvents,
        upcomingEvents,
        totalRegistrations,
      },
    });
  } catch (error) {
    console.error('Get Admin Dashboard Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Platform Detailed Statistics and Chart Data
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getPlatformStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: 'published' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const now = new Date();
    const upcomingEvents = await Event.countDocuments({ status: 'published', date: { $gt: now } });
    const totalRegistrations = await Registration.countDocuments();
    const totalCertificatesIssued = await Registration.countDocuments({ attendanceStatus: 'present', certificateURL: { $ne: '' } });

    const avgParticipation = totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : 0;

    // Category Distribution
    const categoryAgg = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const eventCategoryDistribution = categoryAgg.map((item) => ({
      category: item._id || 'Uncategorized',
      count: item.count,
    }));

    const mostPopularCategoryObj = [...eventCategoryDistribution].sort((a, b) => b.count - a.count)[0];
    const mostPopularCategory = mostPopularCategoryObj ? mostPopularCategoryObj.category : 'N/A';

    // Most Active Organizer
    const activeOrganizerAgg = await Event.aggregate([
      { $group: { _id: '$organizer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let mostActiveOrganizer = 'N/A';
    if (activeOrganizerAgg.length > 0 && activeOrganizerAgg[0]._id) {
      try {
        const orgUser = await User.findById(activeOrganizerAgg[0]._id);
        if (orgUser) mostActiveOrganizer = orgUser.name;
      } catch (err) {
        console.error('Error finding active organizer user:', err.message);
      }
    }

    // Generate last 6 months continuous array
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      last6Months.push({
        monthNum: d.getMonth() + 1,
        yearNum: d.getFullYear(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      });
    }

    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const eventsPerMonthAgg = await Event.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const usersPerMonthAgg = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const participationTrendsAgg = await Registration.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const fillMonthlySeries = (aggData) => {
      const aggMap = new Map();
      aggData.forEach((item) => {
        if (item._id && item._id.month && item._id.year) {
          aggMap.set(`${item._id.year}-${item._id.month}`, item.count);
        }
      });

      return last6Months.map((m) => ({
        month: m.label,
        count: aggMap.get(`${m.yearNum}-${m.monthNum}`) || 0,
      }));
    };

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalStudents,
          totalOrganizers,
          totalEvents,
          activeEvents,
          completedEvents,
          upcomingEvents,
          totalRegistrations,
          totalCertificatesIssued,
          avgParticipation,
          mostPopularCategory,
          mostActiveOrganizer,
        },
        charts: {
          eventsPerMonth: fillMonthlySeries(eventsPerMonthAgg),
          usersPerMonth: fillMonthlySeries(usersPerMonthAgg),
          categoryDistribution: eventCategoryDistribution,
          participationTrends: fillMonthlySeries(participationTrendsAgg),
        },
      },
    });
  } catch (error) {
    console.error('Get Platform Statistics Error:', error.stack || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Paginated Platform Activity Monitoring Logs
// @route   GET /api/admin/activity
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const { search } = req.query;
    const queryObj = {};

    if (search) {
      queryObj.$or = [
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await ActivityLog.countDocuments(queryObj);
    const logs = await ActivityLog.find(queryObj)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (error) {
    console.error('Get Activity Logs Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
