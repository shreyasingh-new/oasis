import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Users, UserCheck, Award, Loader, ArrowLeft, Download, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Participants = () => {
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetchParticipantsData();
  }, [id]);

  const fetchParticipantsData = async () => {
    setLoading(true);
    try {
      // Get event details
      const evRes = await axios.get(`/api/events/${id}`);
      setEvent(evRes.data.data);

      // Get participants list
      const partRes = await axios.get(`/api/events/${id}/participants`);
      setParticipants(partRes.data.data || []);
    } catch (error) {
      console.error('Error fetching participant data:', error);
      toast.error('Failed to load participants list.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (registrationId, newStatus) => {
    try {
      await axios.put('/api/attendance', {
        registrationId,
        status: newStatus,
      });
      toast.success(`Attendance marked as ${newStatus}`);
      fetchParticipantsData(); // Reload list
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update attendance.';
      toast.error(msg);
    }
  };

  const handleCertificateUpload = async (e, registrationId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Filter file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images (JPEG/PNG) and PDFs are allowed');
      return;
    }

    setUploadingId(registrationId);
    const formData = new FormData();
    formData.append('registrationId', registrationId);
    formData.append('certificate', file);

    try {
      await axios.post('/api/upload-certificate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Certificate uploaded successfully!');
      fetchParticipantsData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload certificate.';
      toast.error(msg);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button and title */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Manage Events
        </Link>
        <h1 className="text-3xl font-extrabold text-white">Event Registrants</h1>
        {event && (
          <p className="text-gray-400 text-sm mt-1">
            Managing attendees for: <span className="text-purple-400 font-bold">{event.title}</span>
          </p>
        )}
      </div>

      {participants.length === 0 ? (
        <div className="glass p-16 rounded-3xl text-center text-gray-500 space-y-4 max-w-lg mx-auto">
          <Users size={48} className="text-gray-700 mx-auto animate-pulse" />
          <h3 className="text-md font-bold text-white">No Registrants Yet</h3>
          <p className="text-xs">
            No students have registered for this event yet. Check back later once registration spreads.
          </p>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden border border-gray-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-semibold bg-gray-950/20">
                  <th className="p-4 pl-6">Student Details</th>
                  <th className="p-4">Department & Year</th>
                  <th className="p-4">Registration Date</th>
                  <th className="p-4">Mark Attendance</th>
                  <th className="p-4 pr-6">Certificate Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {participants.map((reg) => {
                  const student = reg.student;
                  if (!student) return null;

                  return (
                    <tr key={reg._id} className="text-gray-300 hover:bg-gray-800/10">
                      {/* Student detail */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-sm">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{student.name}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5 select-all">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department and year */}
                      <td className="p-4 text-xs">
                        <div>{student.department}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Year {student.year}</div>
                      </td>

                      {/* Registration Date */}
                      <td className="p-4 text-xs text-gray-400">
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </td>

                      {/* Attendance select */}
                      <td className="p-4">
                        <select
                          value={reg.attendanceStatus}
                          onChange={(e) => handleStatusChange(reg._id, e.target.value)}
                          className={`bg-gray-900 border text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 appearance-none text-center cursor-pointer ${
                            reg.attendanceStatus === 'present'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                              : reg.attendanceStatus === 'absent'
                              ? 'border-rose-500/30 text-rose-400 bg-rose-500/5'
                              : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                          }`}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="present">✅ Present</option>
                          <option value="absent">❌ Absent</option>
                        </select>
                      </td>

                      {/* Certificate Upload / link */}
                      <td className="p-4 pr-6">
                        <div className="flex items-center gap-3">
                          {reg.attendanceStatus !== 'present' ? (
                            <span className="text-[10px] text-gray-600 font-semibold leading-relaxed">
                              Mark attendance 'Present' to enable
                            </span>
                          ) : uploadingId === reg._id ? (
                            <div className="flex items-center gap-2 text-xs text-purple-400 font-bold">
                              <Loader className="animate-spin" size={14} />
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            <>
                              {/* File Selector */}
                              <label className="cursor-pointer px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-purple-500 hover:text-purple-400 text-xs font-bold transition-all flex items-center gap-1.5">
                                <Upload size={13} />
                                {reg.certificateURL ? 'Update File' : 'Upload File'}
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,image/jpeg,image/png,image/jpg"
                                  onChange={(e) => handleCertificateUpload(e, reg._id)}
                                />
                              </label>

                              {/* View Link if exists */}
                              {reg.certificateURL && (
                                <a
                                  href={reg.certificateURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                  title="View Certificate"
                                >
                                  <Award size={14} />
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
