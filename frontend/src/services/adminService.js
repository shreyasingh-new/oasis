import axios from 'axios';

export const getAdminDashboardStats = async () => {
  const res = await axios.get('/api/admin/dashboard');
  return res.data;
};

export const getPlatformStatistics = async () => {
  const res = await axios.get('/api/admin/statistics');
  return res.data;
};

export const getActivityLogs = async (page = 1, limit = 15, search = '') => {
  const res = await axios.get(`/api/admin/activity?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return res.data;
};

export const getAllUsers = async (role = '', search = '') => {
  const res = await axios.get(`/api/admin/users?role=${role}&search=${encodeURIComponent(search)}`);
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axios.get(`/api/admin/users/${id}`);
  return res.data;
};

export const updateUser = async (id, userData) => {
  const res = await axios.put(`/api/admin/users/${id}`, userData);
  return res.data;
};

export const updateUserStatus = async (id, isActive) => {
  const res = await axios.patch(`/api/admin/users/${id}/status`, { isActive });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axios.delete(`/api/admin/users/${id}`);
  return res.data;
};

export const getAllEvents = async (search = '', category = '', status = '') => {
  const res = await axios.get(`/api/admin/events?search=${encodeURIComponent(search)}&category=${category}&status=${status}`);
  return res.data;
};

export const getEventById = async (id) => {
  const res = await axios.get(`/api/admin/events/${id}`);
  return res.data;
};

export const updateEvent = async (id, eventData) => {
  const res = await axios.put(`/api/admin/events/${id}`, eventData);
  return res.data;
};

export const deleteEvent = async (id) => {
  const res = await axios.delete(`/api/admin/events/${id}`);
  return res.data;
};

export const getEventParticipants = async (id) => {
  const res = await axios.get(`/api/admin/events/${id}/participants`);
  return res.data;
};
