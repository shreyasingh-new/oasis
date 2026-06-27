const Registration = require('../models/Registration');
const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const logActivity = require('../utils/activityLogger');

// @desc    Get participant list for a specific event
// @route   GET /api/events/:id/participants
// @access  Private/Organizer
const getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify organizer owns the event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view participants for this event',
      });
    }

    // Find registrations
    const participants = await Registration.find({ event: eventId })
      .populate('student', 'name email department year profileImage')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: participants.length,
      data: participants,
    });
  } catch (error) {
    console.error('Get Participants Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance for a participant
// @route   PUT /api/attendance
// @access  Private/Organizer
const markAttendance = async (req, res) => {
  try {
    const { registrationId, status } = req.body;

    if (!registrationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registrationId and status',
      });
    }

    if (!['present', 'absent', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Choose from present, absent, pending.',
      });
    }

    // Find the registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }

    // Find the associated event to verify organizer
    const event = await Event.findById(registration.event);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Associated event not found' });
    }

    // Verify organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to manage attendance for this event',
      });
    }

    // Update status
    registration.attendanceStatus = status;
    await registration.save();

    logActivity({
      user: req.user._id,
      role: req.user.role,
      action: 'ATTENDANCE_UPDATE',
      entityType: 'Event',
      entityId: event._id,
      description: `Organizer ${req.user.name} marked attendance as ${status} for event: ${event.title}`,
    });

    res.json({
      success: true,
      message: `Attendance marked as ${status} successfully`,
      data: registration,
    });
  } catch (error) {
    console.error('Mark Attendance Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload and associate certificate with registration (Cloudinary with local fallback)
// @route   POST /api/upload-certificate
// @access  Private/Organizer
const associateCertificate = async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide registrationId',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a certificate file to upload',
      });
    }

    // Find the registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }

    // Find the associated event
    const event = await Event.findById(registration.event);
    if (!event) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Associated event not found' });
    }

    // Verify organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload certificates for this event',
      });
    }

    // Verify attendance is present (cannot upload certificate for absent student)
    if (registration.attendanceStatus !== 'present') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Cannot issue certificate. Student attendance must be marked as present.',
      });
    }

    let certificateURL = '';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const isCloudinaryConfigured = cloudName && !cloudName.includes('placeholder');

    if (isCloudinaryConfigured) {
      try {
        console.log('Uploading certificate to Cloudinary...');
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'oasis_certificates',
        });

        // Remove local file
        fs.unlinkSync(req.file.path);
        certificateURL = result.secure_url;
        console.log('Cloudinary Upload Success:', certificateURL);
      } catch (uploadError) {
        console.error('Cloudinary upload failed, falling back to local storage:', uploadError.message);
        // Fallback to local storage
        certificateURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
    } else {
      console.log('Cloudinary credentials set to placeholder; falling back to local server storage.');
      // Keep file locally
      certificateURL = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Update registration document
    registration.certificateURL = certificateURL;
    await registration.save();

    logActivity({
      user: req.user._id,
      role: req.user.role,
      action: 'CERTIFICATE_UPLOAD',
      entityType: 'Event',
      entityId: event._id,
      description: `Organizer ${req.user.name} uploaded certificate for event: ${event.title}`,
    });

    res.json({
      success: true,
      message: 'Certificate uploaded successfully',
      data: registration,
    });
  } catch (error) {
    console.error('Associate Certificate Error:', error.message);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEventParticipants,
  markAttendance,
  associateCertificate,
};
