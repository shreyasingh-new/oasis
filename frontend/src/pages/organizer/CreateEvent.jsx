import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, MapPin, Users, Type, AlignLeft, HelpCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    venue: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    registrationDeadline: '',
    maxParticipants: '50',
    banner: '',
    status: 'published',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const eventDate = new Date(formData.date);
    const deadlineDate = new Date(formData.registrationDeadline);

    if (deadlineDate > eventDate) {
      toast.error('Registration deadline cannot be after the event date');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        maxParticipants: Number(formData.maxParticipants),
      };

      await axios.post('/api/events', payload);
      toast.success('Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create event.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Create New Event</h1>
        <p className="text-gray-400 text-sm mt-1">Fill out the form below to host and publish a campus event.</p>
      </div>

      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        {/* Glow */}
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
                placeholder="Provide detailed instructions about the event, timelines, requirements..."
                rows="4"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm leading-relaxed"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Category Select */}
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
                Venue / Location
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
                  placeholder="e.g. 10:00 AM"
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
                  placeholder="e.g. 01:00 PM"
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
                  placeholder="e.g. 100"
                  min="1"
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Status Select */}
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
                <option value="published">Published (Visible to Students)</option>
                <option value="draft">Draft (Save privately)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg transition-all mt-6 text-sm"
          >
            {loading ? 'Submitting...' : 'Host Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
