import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Award, Clock, ArrowLeft, Loader, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/events/${id}`);
      setEvent(response.data.data);

      if (user && user.role === 'student') {
        // Check if student is registered
        const regResponse = await axios.get('/api/student/events');
        const registrations = regResponse.data.data;
        const registered = registrations.some((reg) => reg.event?._id === id);
        setIsRegistered(registered);
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      toast.error('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`/api/events/${id}/register`);
      toast.success('Successfully registered for this event!');
      setIsRegistered(true);
      fetchEventDetails(); // Reload participants counts
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`/api/events/${id}/register`);
      toast.success('Registration cancelled successfully.');
      setIsRegistered(false);
      fetchEventDetails();
    } catch (error) {
      const msg = error.response?.data?.message || 'Cancellation failed.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-[#0b0f19]">
        <Loader className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-6">
        <ShieldAlert size={48} className="text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-gray-400 mb-6">The event you are looking for does not exist or has been deleted.</p>
        <Link to="/events" className="px-6 py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-xl font-bold text-sm">
          Back to Events
        </Link>
      </div>
    );
  }

  const isFull = event.currentParticipants >= event.maxParticipants;
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isOwner = user && user.role === 'organizer' && event.organizer?._id === user._id;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 py-10 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to={user ? (user.role === 'organizer' ? '/organizer/dashboard' : '/student/dashboard') : '/'}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Event info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                event.status === 'published' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {event.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{event.title}</h1>

            <p className="text-gray-400 text-sm md:text-md leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-800/40 text-sm">
              <div className="flex gap-3">
                <Calendar className="text-purple-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white">Date and Time</h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">{event.startTime} - {event.endTime}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="text-emerald-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white">Venue</h4>
                  <p className="text-gray-400 text-xs mt-0.5">{event.venue}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Users className="text-blue-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white">Capacity</h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {event.currentParticipants} registered / {event.maxParticipants} max seats
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="text-amber-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-white">Registration Deadline</h4>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(event.registrationDeadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration & Organizer Card */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-md font-bold text-white">Registration Control</h3>
            {user?.role === 'organizer' ? (
              isOwner ? (
                <div className="space-y-2 w-full">
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    You are hosting this event. Manage attendees or edits from dashboard.
                  </p>
                  <Link
                    to={`/organizer/events/${event._id}/edit`}
                    className="block text-center py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white text-xs shadow-md transition-all w-full"
                  >
                    Edit Event Details
                  </Link>
                  <Link
                    to={`/organizer/events/${event._id}/participants`}
                    className="block text-center py-3 rounded-xl font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white text-xs transition-all w-full"
                  >
                    Manage Registrants
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Only students can register for events. Organizer options are locked.
                </p>
              )
            ) : isRegistered ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
                  You are registered for this event!
                </div>
                <button
                  onClick={handleCancelRegistration}
                  disabled={actionLoading || deadlinePassed}
                  className="w-full py-3.5 rounded-xl font-bold bg-rose-600/15 border border-rose-500/20 hover:bg-rose-600/25 text-rose-400 text-xs transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Registration'}
                </button>
                {deadlinePassed && (
                  <p className="text-[10px] text-gray-500 text-center">Cannot cancel registration after event start.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleRegister}
                  disabled={actionLoading || isFull || deadlinePassed}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg transition-all disabled:opacity-50 text-xs"
                >
                  {actionLoading ? 'Registering...' : 'Register for Event'}
                </button>
                {isFull && <p className="text-[10px] text-rose-400 font-bold text-center">Registration closed. Maximum capacity reached.</p>}
                {deadlinePassed && <p className="text-[10px] text-gray-500 font-bold text-center">Registration closed. Deadline has passed.</p>}
              </div>
            )}
          </div>

          {/* Organizer Card */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="text-md font-bold text-white">Event Organizer</h3>
            {event.organizer ? (
              <div className="flex gap-4 items-center p-3 border border-gray-800/40 rounded-2xl bg-gray-950/20">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-lg shadow-md shrink-0">
                  {event.organizer.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-white">{event.organizer.name}</div>
                  <div className="text-gray-500 font-semibold mt-0.5">{event.organizer.department} Department</div>
                  <div className="text-purple-400 font-medium mt-1 select-all">{event.organizer.email}</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Organizer details not available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
