const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Route Mountings
app.use('/api', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/api', organizerRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Root Welcome & Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Oasis API Server',
    health: '/api/health',
    documentation: 'Refer to Oasis deployment guide for API endpoints'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Oasis Backend API is running smoothly' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
