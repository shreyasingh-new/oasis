const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an event title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please add an event category'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Please add a venue'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please add the event date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please add the starting time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please add the ending time'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please add a registration deadline'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Please specify the maximum number of participants'],
      min: [1, 'Maximum participants must be at least 1'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    banner: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'closed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent registration deadline from being after the event date
eventSchema.pre('validate', function (next) {
  if (this.registrationDeadline && this.date) {
    if (this.registrationDeadline > this.date) {
      this.invalidate('registrationDeadline', 'Registration deadline cannot be after the event date');
    }
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
