import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents, updateEvent, deleteEvent } from '../../services/adminService';
import { Search, Filter, Eye, Edit, Trash2, Calendar, Ban, AlertTriangle, X, Check, MapPin, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [deleteModalEvent, setDeleteModalEvent] = useState(null);
  const [editModalEvent, setEditModalEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    status: '',
    maxParticipants: 100,
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllEvents(search, categoryFilter, statusFilter);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (error) {
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleCancelEvent = async (eventObj) => {
    try {
      const res = await updateEvent(eventObj._id, { status: 'cancelled' });
      if (res.success) {
        toast.success(`Event "${eventObj.title}" cancelled.`);
        setEvents(events.map((ev) => (ev._id === eventObj._id ? { ...ev, status: 'cancelled' } : ev)));
      }
    } catch (error) {
      toast.error('Failed to cancel event.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalEvent) return;
    try {
      const res = await deleteEvent(deleteModalEvent._id);
      if (res.success) {
        toast.success(res.message);
        setEvents(events.filter((ev) => ev._id !== deleteModalEvent._id));
        setDeleteModalEvent(null);
      }
    } catch (error) {
      toast.error('Failed to delete event.');
    }
  };

  const openEditModal = (eventObj) => {
    setEditModalEvent(eventObj);
    setEditFormData({
      title: eventObj.title || '',
      description: eventObj.description || '',
      category: eventObj.category || 'Technical',
      venue: eventObj.venue || '',
      status: eventObj.status || 'draft',
      maxParticipants: eventObj.maxParticipants || 100,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateEvent(editModalEvent._id, editFormData);
      if (res.success) {
        toast.success('Event updated successfully!');
        setEvents(events.map((ev) => (ev._id === editModalEvent._id ? res.data : ev)));
        setEditModalEvent(null);
      }
    } catch (error) {
      toast.error('Failed to update event.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Event Management</h1>
        <p className="text-gray-400 text-sm mt-1">Supervise, edit, monitor registration counts, and manage platform events.</p>
      </div>

      {/* Filters & Search */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800/40">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search event title, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass rounded-2xl border border-gray-800/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading platform events...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No events found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 uppercase text-xs text-gray-400 font-bold border-b border-gray-800/60">
                <tr>
                  <th className="px-6 py-4">Event Title</th>
                  <th className="px-6 py-4">Organizer</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date & Venue</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-800/20 transition-all">
                    <td className="px-6 py-4 font-bold text-white max-w-xs truncate">
                      {ev.title}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-300">
                      {ev.organizer?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-xs uppercase font-semibold text-purple-400">
                      {ev.category}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      <div>{new Date(ev.date).toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-500">{ev.venue}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-400">
                      {ev.currentParticipants} / {ev.maxParticipants}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        ev.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        ev.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        ev.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/events/${ev._id}`}
                          className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
                          title="View Details & Participants"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => openEditModal(ev)}
                          className="p-2 rounded-lg bg-gray-800/60 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 transition-all"
                          title="Edit Event"
                        >
                          <Edit size={16} />
                        </button>
                        {ev.status !== 'cancelled' && ev.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelEvent(ev)}
                            className="p-2 rounded-lg bg-gray-800/60 hover:bg-amber-600/20 text-gray-300 hover:text-amber-400 transition-all"
                            title="Cancel Event"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModalEvent(ev)}
                          className="p-2 rounded-lg bg-gray-800/60 hover:bg-rose-600/20 text-gray-300 hover:text-rose-400 transition-all"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-3xl border border-gray-800 w-full max-w-lg space-y-6 relative animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Edit Event Details</h3>
              <button onClick={() => setEditModalEvent(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Venue</label>
                <input
                  type="text"
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Capacity</label>
                <input
                  type="number"
                  value={editFormData.maxParticipants}
                  onChange={(e) => setEditFormData({ ...editFormData, maxParticipants: Number(e.target.value) })}
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditModalEvent(null)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-gray-800/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-3xl border border-gray-800 w-full max-w-md text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Delete Event?</h3>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete <strong className="text-white">{deleteModalEvent.title}</strong>? All associated registrations will be affected.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalEvent(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-gray-800/40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
