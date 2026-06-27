import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, Users, Edit, Trash2, Eye, Loader, PlusCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const fetchOrganizerEvents = async () => {
    setLoading(true);
    try {
      // Re-use organizer dashboard stats which returns all owned events (including drafts)
      const response = await axios.get('/api/organizer/dashboard');
      setEvents(response.data.data.eventAnalytics || []);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      toast.error('Failed to load events list.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/events/${eventId}`);
        toast.success('Event deleted successfully.');
        fetchOrganizerEvents(); // Refresh list
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to delete event.';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manage Events</h1>
          <p className="text-gray-400 text-sm mt-1">Review registrations, manage drafts, and issue certificates.</p>
        </div>
        <Link
          to="/organizer/create"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-bold text-sm shadow-md flex items-center gap-2 w-fit transition-all"
        >
          <PlusCircle size={16} />
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="glass p-16 rounded-3xl text-center text-gray-500 space-y-4 max-w-lg mx-auto">
          <Calendar size={48} className="text-gray-700 mx-auto" />
          <h3 className="text-md font-bold text-white">No Events Hosted</h3>
          <p className="text-xs max-w-xs mx-auto">
            You haven't created any events yet. Click 'Create Event' to launch your first campus program.
          </p>
        </div>
      ) : (
        <div className="glass rounded-3xl overflow-hidden border border-gray-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-semibold bg-gray-950/20">
                  <th className="p-4 pl-6">Event Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {events.map((event) => (
                  <tr key={event._id} className="text-gray-300 hover:bg-gray-800/10">
                    <td className="p-4 pl-6 font-bold text-white">{event.title}</td>
                    <td className="p-4 text-xs font-semibold">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs">{event.category}</td>
                    <td className="p-4 text-xs font-bold">
                      {event.currentParticipants} / {event.maxParticipants} slots
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          event.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : event.status === 'closed'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/organizer/events/${event._id}/participants`}
                          className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:text-purple-400 transition-all"
                          title="View Registrants"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to={`/organizer/events/${event._id}/edit`}
                          className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:text-emerald-400 transition-all"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:text-rose-400 transition-all"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;
