import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import StudentDashboard from '../pages/student/Dashboard';
import OrganizerDashboard from '../pages/organizer/Dashboard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Events from '../pages/Events';
import EventDetails from '../pages/EventDetails';
import Profile from '../pages/Profile';
import MyEvents from '../pages/student/MyEvents';
import Certificates from '../pages/student/Certificates';
import CreateEvent from '../pages/organizer/CreateEvent';
import ManageEvents from '../pages/organizer/ManageEvents';
import EditEvent from '../pages/organizer/EditEvent';
import Participants from '../pages/organizer/Participants';

// Admin Imports
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import UserDetails from '../pages/admin/UserDetails';
import EventManagement from '../pages/admin/EventManagement';
import AdminEventDetails from '../pages/admin/EventDetails';
import PlatformStatistics from '../pages/admin/PlatformStatistics';
import ActivityMonitor from '../pages/admin/ActivityMonitor';

// Custom Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect if they don't have authorization roles
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  const getRedirectForRole = () => {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  };

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? getRedirectForRole() : <Login />} />
      <Route path="/register" element={user ? getRedirectForRole() : <Register />} />

      <Route path="/admin/login" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetails />} />

      {/* Admin Protected Pages */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <UserDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <EventManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminEventDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <PlatformStatistics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <ActivityMonitor />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Protected Pages */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/events"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <MyEvents />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/certificates"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <Certificates />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Organizer Protected Pages */}
      <Route
        path="/organizer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <DashboardLayout>
              <OrganizerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/create"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <DashboardLayout>
              <CreateEvent />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <DashboardLayout>
              <ManageEvents />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <DashboardLayout>
              <EditEvent />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/events/:id/participants"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <DashboardLayout>
              <Participants />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/profile"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
