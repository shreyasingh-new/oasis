import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Type, AlignLeft, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    venue: '',
    date: '',
    startTime: '',
    endTime: '',
    registrationDeadline: '',
    maxParticipants: '',
    banner: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      const data = response.data.data;

      // Format dates to YYYY-MM-DD for HTML inputs
      const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
      const formattedDeadline = data.registrationDeadline
        ? new Date(data.registrationDeadline).toISOString().split('T')[0]
        : '';

      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'Workshop',
        venue: data.venue || '',
        date: formattedDate,
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        registrationDeadline: formattedDeadline,
        maxParticipants: data.maxParticipants?.toString() || '50',
        banner: data.banner || '',
        status: data.status || 'draft',
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details.');
      navigate('/organizer/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const eventDate = new Date(formData.date);
    const deadlineDate = new Date(formData.registrationDeadline);

    if (deadlineDate > eventDate) {
      toast.error('Registration deadline cannot be after the event date');
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        maxParticipants: Number(formData.maxParticipants),
      };

      await axios.put(`/api/events/${id}`, payload);
      toast.success('Event updated successfully!');
      navigate('/organizer/events');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update event.';
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
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
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Edit Event Details</h1>
        <p className="text-gray-400 text-sm mt-1">Modify dates, capacities, or descriptions for your event.</p>
      </div>

      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Event Title
            </label>
            <div className="relative">
              <Type className="absolute left-4 top-3.5 text-gray-505" size={16} />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. CodeSprint 2026 Hacks"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Description
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-3.5 text-gray-505" size={16} />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed instructions about the event..."
                rows="4"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm appearance-none"
              >
                <option value="Workshop">Workshop</option>
                <option value="Tech Hackathon">Tech Hackathon</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Seminar">Seminar</option>
                <option value="Webinar">Webinar</option>
              </select>
            </div>

            {/* Venue */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Venue
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-505" size={16} />
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="e.g. Auditorium Hall B"
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Event Date */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Event Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-gray-505" size={16} />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm appearance-none"
                  required
                />
              </div>
            </div>

            {/* Registration Deadline */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Registration Deadline
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-gray-505" size={16} />
                <input
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm appearance-none"
                  required
                />
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 text-gray-505" size={16} />
                <input
                  type="text"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 text-gray-505" size={16} />
                <input
                  type="text"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Max Participants */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Maximum Seats
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 text-gray-505" size={16} />
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm appearance-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed (Stop Registrations)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg transition-all mt-6 text-sm"
          >
            {submitLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;
