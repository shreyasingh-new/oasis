const Registration = require('../models/Registration');
const Event = require('../models/Event');
const logActivity = require('../utils/activityLogger');

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private/Student
const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    // Fetch the target event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if event is active (published)
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: `Cannot register. This event is currently in ${event.status} status.`,
      });
    }

    // Check if registration deadline has passed
    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this event',
      });
    }

    // Check if student is already registered
    const existingRegistration = await Registration.findOne({
      student: studentId,
      event: eventId,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    // Check if capacity is reached
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked. Maximum capacity reached.',
      });
    }

    // Create the registration
    const registration = new Registration({
      student: studentId,
      event: eventId,
    });

    await registration.save();

    // Increment current participants in Event
    event.currentParticipants += 1;
    await event.save();

    logActivity({
      user: req.user._id,
      role: req.user.role,
      action: 'EVENT_REGISTRATION',
      entityType: 'Event',
      entityId: event._id,
      description: `Student ${req.user.name} registered for event: ${event.title}`,
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully for the event',
      data: registration,
    });
  } catch (error) {
    console.error('Register for Event Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel registration for an event
// @route   DELETE /api/events/:id/register
// @access  Private/Student
const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    // Find the registration
    const registration = await Registration.findOne({
      student: studentId,
      event: eventId,
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found for this event',
      });
    }

    // Find event to verify if cancellation is allowed
    const event = await Event.findById(eventId);
    if (event) {
      const now = new Date();
      // Block cancellation if event date has passed
      if (now > new Date(event.date)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel registration after the event date',
        });
      }
      
      // Decrement participants count in Event
      if (event.currentParticipants > 0) {
        event.currentParticipants -= 1;
        await event.save();
      }
    }

    // Remove registration record
    await registration.deleteOne();

    res.json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's registered events
// @route   GET /api/student/events
// @access  Private/Student
const getRegisteredEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email department',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('Get Registered Events Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's certificates (attended events)
// @route   GET /api/student/certificates
// @access  Private/Student
const getStudentCertificates = async (req, res) => {
  try {
    const certificates = await Registration.find({
      student: req.user._id,
      attendanceStatus: 'present',
      certificateURL: { $ne: '' },
    })
      .populate('event', 'title date venue category')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error('Get Student Certificates Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getRegisteredEvents,
  getStudentCertificates,
};
