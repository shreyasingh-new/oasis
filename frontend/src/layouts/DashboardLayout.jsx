import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  LayoutDashboard,
  Award,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Settings,
  Bell,
  Compass,
  Users,
  BarChart2,
  Activity
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    console.log('DashboardLayout: handleLogout initiated');
    logout();
  };

  // Define sidebar links based on user role
  const getSidebarLinks = () => {
    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Event Management', path: '/admin/events', icon: Calendar },
        { name: 'Platform Statistics', path: '/admin/statistics', icon: BarChart2 },
        { name: 'Activity Monitor', path: '/admin/activity', icon: Activity },
        { name: 'Profile', path: '/admin/profile', icon: User },
      ];
    } else if (user.role === 'organizer') {
      return [
        { name: 'Dashboard', path: '/organizer/dashboard', icon: LayoutDashboard },
        { name: 'Create Event', path: '/organizer/create', icon: PlusCircle },
        { name: 'Manage Events', path: '/organizer/events', icon: Calendar },
        { name: 'Profile', path: '/organizer/profile', icon: User },
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Explore Events', path: '/events', icon: Compass },
        { name: 'My Events', path: '/student/events', icon: Calendar },
        { name: 'Certificates', path: '/student/certificates', icon: Award },
        { name: 'Profile', path: '/student/profile', icon: User },
      ];
    }
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex">
      {/* Background radial effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 z-40 glass border-r border-gray-800/40 p-5">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center font-bold text-lg text-white">
            O
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Oasis
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                }`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800/60 pt-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <aside className="w-64 glass border-r border-gray-800/40 p-5 flex flex-col h-full animate-slide-in">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center font-bold text-md text-white">
                  O
                </div>
                <span className="font-bold text-lg text-white">Oasis</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-800/60 pt-4 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Navbar */}
        <header className="sticky top-0 z-30 glass border-b border-gray-800/30 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white mr-4"
          >
            <Menu size={20} />
          </button>

          <div className="text-sm font-semibold text-gray-400 hidden sm:block">
            Welcome back, <span className="text-white">{user.name}</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative w-9 h-9 rounded-xl bg-gray-900 border border-gray-800/60 flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-800" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-sm shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Children */}
        <main className="flex-1 p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
