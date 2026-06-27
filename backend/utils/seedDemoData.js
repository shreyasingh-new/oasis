const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ActivityLog = require('../models/ActivityLog');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDemoData = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding demo data for Oasis platform...');

    // 1. Create Sample Organizers
    const org1 = await User.findOneAndUpdate(
      { email: 'org.tech@oasis.com' },
      {
        name: 'Tech Club Organizer',
        email: 'org.tech@oasis.com',
        password: 'password123',
        role: 'organizer',
        department: 'Computer Science',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const org2 = await User.findOneAndUpdate(
      { email: 'org.cultural@oasis.com' },
      {
        name: 'Cultural Society',
        email: 'org.cultural@oasis.com',
        password: 'password123',
        role: 'organizer',
        department: 'Arts & Media',
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // 2. Create Sample Students
    const student1 = await User.findOneAndUpdate(
      { email: 'student.alex@oasis.com' },
      {
        name: 'Alex Rivera',
        email: 'student.alex@oasis.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        year: 3,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    const student2 = await User.findOneAndUpdate(
      { email: 'student.sarah@oasis.com' },
      {
        name: 'Sarah Chen',
        email: 'student.sarah@oasis.com',
        password: 'password123',
        role: 'student',
        department: 'Electrical Engineering',
        year: 2,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // 3. Create Sample Events
    const ev1 = await Event.findOneAndUpdate(
      { title: 'HackOasis 2026 Hackathon' },
      {
        title: 'HackOasis 2026 Hackathon',
        description: 'Annual 24-hour campus hackathon for building innovative AI and web applications.',
        category: 'Technical',
        venue: 'Main Auditorium & CS Labs',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxParticipants: 150,
        currentParticipants: 2,
        status: 'published',
        organizer: org1._id,
      },
      { upsert: true, new: true }
    );

    const ev2 = await Event.findOneAndUpdate(
      { title: 'Campus Music & Dance Fest' },
      {
        title: 'Campus Music & Dance Fest',
        description: 'Inter-college cultural competition with live bands, solo dance, and art showcases.',
        category: 'Cultural',
        venue: 'Open Air Amphitheatre',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startTime: '04:00 PM',
        endTime: '10:00 PM',
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        maxParticipants: 300,
        currentParticipants: 1,
        status: 'published',
        organizer: org2._id,
      },
      { upsert: true, new: true }
    );

    const ev3 = await Event.findOneAndUpdate(
      { title: 'AI & Machine Learning Bootcamp' },
      {
        title: 'AI & Machine Learning Bootcamp',
        description: 'Hands-on workshop covering PyTorch, neural networks, and LLM fine-tuning.',
        category: 'Workshop',
        venue: 'Lab 4, Tech Block',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        startTime: '10:00 AM',
        endTime: '02:00 PM',
        registrationDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        maxParticipants: 50,
        currentParticipants: 2,
        status: 'completed',
        organizer: org1._id,
      },
      { upsert: true, new: true }
    );

    // 4. Create Registrations
    await Registration.findOneAndUpdate(
      { student: student1._id, event: ev1._id },
      { student: student1._id, event: ev1._id, attendanceStatus: 'pending' },
      { upsert: true }
    );

    await Registration.findOneAndUpdate(
      { student: student2._id, event: ev1._id },
      { student: student2._id, event: ev1._id, attendanceStatus: 'pending' },
      { upsert: true }
    );

    await Registration.findOneAndUpdate(
      { student: student1._id, event: ev3._id },
      {
        student: student1._id,
        event: ev3._id,
        attendanceStatus: 'present',
        certificateURL: 'https://images.unsplash.com/photo-1589330694653-aded6fac7718?auto=format&fit=crop&w=800&q=80',
      },
      { upsert: true }
    );

    // 5. Activity Logs
    await ActivityLog.create({
      user: org1._id,
      role: 'organizer',
      action: 'CREATE_EVENT',
      entityType: 'Event',
      entityId: ev1._id,
      description: `Organizer ${org1.name} created event: ${ev1.title}`,
    });

    console.log('✅ Demo platform data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error.message);
    process.exit(1);
  }
};

seedDemoData();
