import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, getEventParticipants } from '../../services/adminService';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Download, ShieldCheck, Award, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, partRes] = await Promise.all([
          getEventById(id),
          getEventParticipants(id),
        ]);
        if (evRes.success) setEvent(evRes.data);
        if (partRes.success) setParticipants(partRes.data);
      } catch (error) {
        toast.error('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownloadCSV = () => {
    if (participants.length === 0) {
      toast.error('No registered participants to export.');
      return;
    }

    const headers = ['Student Name,Email,Department,Year,Attendance Status,Certificate Issued\n'];
    const rows = participants.map((p) => {
      const name = `"${p.student?.name || ''}"`;
      const email = `"${p.student?.email || ''}"`;
      const dept = `"${p.student?.department || ''}"`;
      const yr = p.student?.year || '';
      const att = p.attendanceStatus || 'pending';
      const cert = p.certificateURL ? 'Yes' : 'No';
      return `${name},${email},${dept},${yr},${att},${cert}\n`;
    });

    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participants_${event?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Participant list downloaded as CSV!');
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400 animate-pulse">Loading event overview & participants...</div>;
  }

  if (!event) {
    return <div className="p-12 text-center text-gray-400">Event details not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Link to="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-all">
        <ArrowLeft size={16} /> Back to Events
      </Link>

      {/* Hero Header */}
      <div className="glass p-8 rounded-3xl border border-gray-800/40 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                event.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-300'
              }`}>
                {event.status}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">{event.title}</h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-400" /> Organized by: <strong className="text-white">{event.organizer?.name}</strong> ({event.organizer?.department})
            </p>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg flex items-center justify-center gap-2 transition-all text-sm w-full md:w-auto"
          >
            <Download size={18} /> Download Participant List (CSV)
          </button>
        </div>

        {/* Info Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-800/60 text-sm">
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar size={18} className="text-purple-400" />
            <span>{new Date(event.date).toLocaleDateString()} ({event.startTime} - {event.endTime})</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin size={18} className="text-emerald-400" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Users size={18} className="text-amber-400" />
            <span>{event.currentParticipants} / {event.maxParticipants} Registered</span>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={20} className="text-emerald-400" /> Registered Participants ({participants.length})
        </h3>

        <div className="glass rounded-2xl border border-gray-800/40 overflow-hidden">
          {participants.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No students registered for this event yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-900/60 uppercase text-xs text-gray-400 font-bold border-b border-gray-800/60">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Department & Year</th>
                    <th className="px-6 py-4">Attendance</th>
                    <th className="px-6 py-4">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {participants.map((p) => (
                    <tr key={p._id}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{p.student?.name}</p>
                        <p className="text-xs text-gray-400">{p.student?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-300">
                        {p.student?.department} {p.student?.year ? `(Yr ${p.student.year})` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          p.attendanceStatus === 'present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {p.attendanceStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {p.certificateURL ? (
                          <a href={p.certificateURL} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                            <Award size={14} /> View Issued Certificate
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventDetails;
