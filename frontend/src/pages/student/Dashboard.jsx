import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Award, CheckCircle, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/student/dashboard');
        setData(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard metrics.');
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
        <h3 className="text-xl font-bold text-red-400 mb-2">Error loading dashboard</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const { stats, recentRegistrations, profile } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Student Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Monitor your registered events, access completion certificates, and discover what's next.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Registered</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.totalRegistered}</div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Upcoming Events</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.upcomingEvents}</div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Completed Events</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.completedEvents}</div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award size={22} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Certificates</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{stats.certificates}</div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations Table */}
        <div className="glass p-6 rounded-3xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
            <Link to="/student/events" className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">You haven't registered for any events yet.</p>
              <Link to="/events" className="inline-block mt-4 text-xs font-bold text-purple-400 hover:underline">
                Browse Events →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-semibold">
                    <th className="pb-3 pl-2">Event</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Attendance</th>
                    <th className="pb-3">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {recentRegistrations.map((reg) => (
                    <tr key={reg._id} className="text-gray-300 hover:bg-gray-800/10">
                      <td className="py-4 pl-2 font-bold">{reg.event?.title || 'Unknown Event'}</td>
                      <td className="py-4">
                        {reg.event ? new Date(reg.event.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            reg.attendanceStatus === 'present'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : reg.attendanceStatus === 'absent'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}
                        >
                          {reg.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        {reg.certificateURL ? (
                          <a
                            href={reg.certificateURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-400 hover:underline font-semibold"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="glass p-6 rounded-3xl h-fit space-y-6">
          <h3 className="text-lg font-bold text-white">Profile Details</h3>
          <div className="flex flex-col items-center text-center p-4 border border-gray-800/40 rounded-2xl bg-gray-950/20">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-extrabold text-2xl mb-4 shadow-lg shadow-purple-500/5">
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
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Academic Year</span>
                <span className="text-gray-300 font-bold">Year {profile.year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
