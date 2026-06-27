const Event = require('../models/Event');
const logActivity = require('../utils/activityLogger');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
      banner,
      status,
    } = req.body;

    // Build event object
    const event = new Event({
      title,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      registrationDeadline,
      maxParticipants,
      banner,
      status: status || 'draft',
      organizer: req.user._id, // Assumed populated by protect middleware
    });

    const savedEvent = await event.save();

    logActivity({
      user: req.user._id,
      role: req.user.role,
      action: 'CREATE_EVENT',
      entityType: 'Event',
      entityId: savedEvent._id,
      description: `Organizer ${req.user.name} created event: ${savedEvent.title}`,
    });

    res.status(201).json({
      success: true,
      data: savedEvent,
    });
  } catch (error) {
    console.error('Create Event Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const queryObj = {};

    // Filter by category
    if (category) {
      queryObj.category = category;
    }

    // Filter by status (If user is student/public, they generally only see published/closed. If organizer, they might see their drafts too)
    if (status) {
      queryObj.status = status;
    } else {
      // Default: exclude drafts for public queries unless requested (or just show all if not strict)
      // For this project, let's allow finding all unless student/guest is browsing.
      // Let's just filter by what's passed, or if none, return all non-draft events for standard browse.
      // To keep it simple, we search based on query.
    }

    // Search query on title/description
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(queryObj)
      .populate('organizer', 'name email department profileImage')
      .sort({ date: 1 }); // Sort by date ascending

    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Get Events Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email department profileImage');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get Event By ID Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Organizer
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to edit this event',
      });
    }

    // Update fields
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
      role: req.user.role,
      action: 'UPDATE_EVENT',
      entityType: 'Event',
      entityId: updatedEvent._id,
      description: `Updated event: ${updatedEvent.title}`,
    });

    res.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Update Event Error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized to delete this event',
      });
    }

    const eventTitle = event.title;
    await event.deleteOne();

    logActivity({
      user: req.user._id,
      role: req.user.role,
      action: 'DELETE_EVENT',
      entityType: 'Event',
      entityId: req.params.id,
      description: `Deleted event: ${eventTitle}`,
    });

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete Event Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
