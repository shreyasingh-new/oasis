import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Loader, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegisteredEvents();
  }, []);

  const fetchRegisteredEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/student/events');
      setRegistrations(response.data.data);
    } catch (error) {
      console.error('Error fetching registered events:', error);
      toast.error('Failed to load registered events.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel your registration?')) {
      try {
        await axios.delete(`/api/events/${eventId}/register`);
        toast.success('Registration cancelled successfully.');
        fetchRegisteredEvents(); // Reload lists
      } catch (error) {
        const msg = error.response?.data?.message || 'Cancellation failed.';
        toast.error(msg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const now = new Date();

  // Split registrations into upcoming and completed
  const upcomingRegs = registrations.filter(
    (reg) => reg.event && new Date(reg.event.date) >= now
  );
  const completedRegs = registrations.filter(
    (reg) => reg.event && new Date(reg.event.date) < now
  );

  const renderEventGrid = (regs, isUpcoming) => {
    if (regs.length === 0) {
      return (
        <div className="glass p-8 rounded-3xl text-center text-gray-500 text-sm">
          No events found in this category.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {regs.map((reg) => {
          const ev = reg.event;
          if (!ev) return null;

          return (
            <div key={reg._id} className="glass p-6 rounded-3xl flex flex-col justify-between h-[240px] relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                    {ev.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    reg.attendanceStatus === 'present'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : reg.attendanceStatus === 'absent'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {reg.attendanceStatus}
                  </span>
                </div>

                <h3 className="text-md font-bold text-white leading-snug line-clamp-1">{ev.title}</h3>

                <div className="space-y-1.5 pt-1 text-xs text-gray-500 font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-purple-500" />
                    <span>{new Date(ev.date).toLocaleDateString()} at {ev.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-emerald-500" />
                    <span>{ev.venue}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800/40 flex items-center justify-between gap-3">
                <Link
                  to={`/events/${ev._id}`}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
                >
                  View Details <ArrowRight size={12} />
                </Link>

                {isUpcoming && (
                  <button
                    onClick={() => handleCancelRegistration(ev._id)}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <XCircle size={14} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">My Registered Events</h1>
        <p className="text-gray-400 text-sm mt-1">Keep track of your registered college events, schedules, and attendances.</p>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white border-l-2 border-purple-500 pl-3">Upcoming Schedules</h2>
        {renderEventGrid(upcomingRegs, true)}
      </div>

      {/* Completed Section */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white border-l-2 border-emerald-500 pl-3">Completed Events</h2>
        {renderEventGrid(completedRegs, false)}
      </div>
    </div>
  );
};

export default MyEvents;
