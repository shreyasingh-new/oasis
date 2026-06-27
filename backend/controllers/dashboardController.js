const Registration = require('../models/Registration');
const Event = require('../models/Event');

// @desc    Get Student Dashboard Statistics
// @route   GET /api/student/dashboard
// @access  Private/Student
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch all registrations for this student
    const registrations = await Registration.find({ student: studentId })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email department',
        },
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    let upcomingCount = 0;
    let completedCount = 0;
    let certificatesCount = 0;

    registrations.forEach((reg) => {
      if (reg.event) {
        const eventDate = new Date(reg.event.date);
        if (eventDate >= now) {
          upcomingCount++;
        } else {
          completedCount++;
        }
      }
      if (reg.attendanceStatus === 'present' && reg.certificateURL) {
        certificatesCount++;
      }
    });

    // Extract recent 3 registrations
    const recentRegistrations = registrations.slice(0, 3);

    res.json({
      success: true,
      data: {
        stats: {
          totalRegistered: registrations.length,
          upcomingEvents: upcomingCount,
          completedEvents: completedCount,
          certificates: certificatesCount,
        },
        recentRegistrations,
        profile: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          department: req.user.department,
          year: req.user.year,
          profileImage: req.user.profileImage,
        },
      },
    });
  } catch (error) {
    console.error('Student Dashboard Stats Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Organizer Dashboard Statistics
// @route   GET /api/organizer/dashboard
// @access  Private/Organizer
const getOrganizerDashboard = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Fetch all events created by this organizer
    const organizerEvents = await Event.find({ organizer: organizerId }).sort({ date: 1 });
    const eventIds = organizerEvents.map((e) => e._id);

    const now = new Date();
    let activeEventsCount = 0;
    let totalParticipantsSum = 0;

    organizerEvents.forEach((event) => {
      // An active event is published and hasn't happened yet
      if (event.status === 'published' && new Date(event.date) >= now) {
        activeEventsCount++;
      }
      totalParticipantsSum += event.currentParticipants;
    });

    // Count certificates uploaded (present and non-empty URL)
    const certificatesUploadedCount = await Registration.countDocuments({
      event: { $in: eventIds },
      attendanceStatus: 'present',
      certificateURL: { $ne: '' },
    });

    // Compile event-by-event analytics
    const eventAnalytics = organizerEvents.map((event) => {
      const occupancy = event.maxParticipants > 0 
        ? Math.round((event.currentParticipants / event.maxParticipants) * 100)
        : 0;

      return {
        _id: event._id,
        title: event.title,
        date: event.date,
        category: event.category,
        status: event.status,
        maxParticipants: event.maxParticipants,
        currentParticipants: event.currentParticipants,
        occupancyPercentage: occupancy,
      };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalEvents: organizerEvents.length,
          activeEvents: activeEventsCount,
          totalParticipants: totalParticipantsSum,
          certificatesUploaded: certificatesUploadedCount,
        },
        eventAnalytics,
        profile: {
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          department: req.user.department,
          profileImage: req.user.profileImage,
        },
      },
    });
  } catch (error) {
    console.error('Organizer Dashboard Stats Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getOrganizerDashboard,
};
