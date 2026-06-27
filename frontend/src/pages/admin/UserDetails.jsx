import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserById } from '../../services/adminService';
import { ArrowLeft, User, Mail, Building2, Calendar, Award, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserDetails = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserById(id);
        if (res.success) {
          setUserData(res.data);
        }
      } catch (error) {
        toast.error('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-gray-400 animate-pulse">Loading user profile & history...</div>;
  }

  if (!userData || !userData.user) {
    return <div className="p-12 text-center text-gray-400">User not found.</div>;
  }

  const { user, createdEvents, participationHistory } = userData;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all">
        <ArrowLeft size={16} /> Back to Users
      </Link>

      {/* User Header Card */}
      <div className="glass p-8 rounded-3xl border border-gray-800/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center font-black text-3xl text-white shadow-xl shadow-purple-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                user.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                user.role === 'organizer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-gray-400 text-sm flex items-center gap-2"><Mail size={14}/> {user.email}</p>
            <p className="text-gray-400 text-sm flex items-center gap-2"><Building2 size={14}/> {user.department} {user.role === 'student' && user.year ? `• Year ${user.year}` : ''}</p>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-800 w-full sm:w-auto">
          <p className="text-xs text-gray-500 uppercase font-bold">Account Status</p>
          <p className={`text-sm font-bold mt-1 ${user.isActive !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
            {user.isActive !== false ? '● Active' : '● Deactivated'}
          </p>
          <p className="text-xs text-gray-500 mt-2">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Role History Section */}
      {user.role === 'organizer' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-amber-400" /> Organizer Created Events ({createdEvents.length})
          </h3>
          {createdEvents.length === 0 ? (
            <div className="glass p-6 rounded-2xl text-gray-400 text-sm text-center">No events created by this organizer yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {createdEvents.map((ev) => (
                <div key={ev._id} className="glass p-5 rounded-2xl border border-gray-800/40 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white text-base">{ev.title}</h4>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 capitalize">{ev.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{ev.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800/60">
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                    <span>{ev.currentParticipants} / {ev.maxParticipants} Registered</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.role === 'student' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-emerald-400" /> Student Event Participation History ({participationHistory.length})
          </h3>
          {participationHistory.length === 0 ? (
            <div className="glass p-6 rounded-2xl text-gray-400 text-sm text-center">No event registrations found for this student.</div>
          ) : (
            <div className="glass rounded-2xl border border-gray-800/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900/60 uppercase text-xs text-gray-400 font-bold border-b border-gray-800/60">
                    <tr>
                      <th className="px-6 py-4">Event</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Attendance</th>
                      <th className="px-6 py-4">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    {participationHistory.map((reg) => (
                      <tr key={reg._id}>
                        <td className="px-6 py-4 font-bold text-white">
                          {reg.event?.title || 'Unknown Event'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 uppercase">{reg.event?.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            reg.attendanceStatus === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {reg.attendanceStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {reg.certificateURL ? (
                            <a href={reg.certificateURL} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                              View Certificate
                            </a>
                          ) : (
                            <span className="text-gray-600">Not Issued</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetails;
