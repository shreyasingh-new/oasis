const ActivityLog = require('../models/ActivityLog');

/**
 * Log platform activity
 * @param {Object} params
 * @param {string} params.user - User ID
 * @param {string} params.role - User role (student, organizer, admin)
 * @param {string} params.action - Action name (e.g. 'REGISTER', 'CREATE_EVENT', etc.)
 * @param {string} params.entityType - Entity type ('User', 'Event', 'Registration')
 * @param {string} [params.entityId] - ID of affected entity
 * @param {string} params.description - Human-readable details
 */
const logActivity = async ({ user, role, action, entityType, entityId, description }) => {
  try {
    await ActivityLog.create({
      user,
      role,
      action,
      entityType,
      entityId: entityId || null,
      description,
    });
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = logActivity;
