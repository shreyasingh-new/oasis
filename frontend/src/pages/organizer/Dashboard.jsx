import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Award, Eye, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrganizerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/organizer/dashboard');
        setData(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-gray-800 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-3xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-800 rounded-3xl mt-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 rounded-3xl border border-red-500/20 text-center max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-red-400 mb-2">Error loading analytics</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const { stats, eventAnalytics, profile } = data;

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Organizer Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track registration trends, monitor active events, and review participation analytics.
          </p>
        </div>
        <Link
          to="/organizer/create"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-sm shadow-lg shadow-purple-500/10 flex items-center gap-2 w-fit transition-all"
        >
          <PlusCircle size={16} />
          Create Event
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Events</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.totalEvents}</div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active Events</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.activeEvents}</div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Registrants</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.totalParticipants}</div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Certs Uploaded</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.certificatesUploaded}</div>
          </div>
        </div>
      </div>

      {/* Analytics & Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Occupancy Analytics */}
        <div className="glass p-6 rounded-3xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Event Registration Analytics</h3>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Live Counts</span>
          </div>

          {eventAnalytics.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-sm">No events found. Start by hosting your first event!</p>
              <Link to="/organizer/create" className="inline-block mt-4 text-xs font-bold text-purple-400 hover:underline">
                Host Event Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {eventAnalytics.map((event) => (
                <div key={event._id} className="p-4 border border-gray-800/40 rounded-2xl bg-gray-950/15 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{event.title}</h4>
                      <div className="text-[10px] text-gray-500 font-semibold mt-0.5">
                        Date: {new Date(event.date).toLocaleDateString()} | Category: {event.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          event.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : event.status === 'closed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {event.status}
                      </span>
                      <Link
                        to={`/organizer/events/${event._id}/participants`}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800/60 hover:text-purple-400 transition-colors"
                        title="View Participants"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Progress Occupancy */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                      <span>Occupancy</span>
                      <span className="font-bold text-gray-300">
                        {event.currentParticipants} / {event.maxParticipants} slots ({event.occupancyPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800/40">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(event.occupancyPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="glass p-6 rounded-3xl h-fit space-y-6">
          <h3 className="text-lg font-bold text-white">Organizer Details</h3>
          <div className="flex flex-col items-center text-center p-4 border border-gray-800/40 rounded-2xl bg-gray-950/20">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-extrabold text-2xl mb-4 shadow-lg shadow-emerald-500/5">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h4 className="text-md font-bold text-white">{profile.name}</h4>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{profile.role}</p>

            <div className="w-full text-left space-y-3 mt-6 pt-6 border-t border-gray-800/60 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Email</span>
                <span className="text-gray-300 font-bold">{profile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Department</span>
                <span className="text-gray-300 font-bold">{profile.department}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
