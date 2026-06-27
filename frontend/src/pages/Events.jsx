import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, Filter, Loader } from 'lucide-react';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      params.status = 'published'; // Show only published events to students

      const response = await axios.get('/api/events', { params });
      setEvents(response.data.data);

      // Extract unique categories for filter
      if (categories.length === 0) {
        const uniqueCats = [...new Set(response.data.data.map((e) => e.category))];
        setCategories(uniqueCats);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Campus Events</h1>
        <p className="text-gray-400 text-sm mt-1">Discover, register, and attend events happening across college.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, keyword..."
            className="w-full bg-gray-950/40 border border-gray-800 rounded-xl pl-12 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all text-sm"
          />
        </form>

        {/* Category select */}
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-4 top-3 text-gray-500" size={16} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-950/40 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-all text-sm appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchEvents}
          className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white text-sm shadow-md transition-all"
        >
          Search
        </button>
      </div>

      {/* Events Listing */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin text-purple-500" size={32} />
        </div>
      ) : events.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center text-gray-500">
          <p className="text-sm">No active events matching your filter were found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isFull = event.currentParticipants >= event.maxParticipants;
            const deadlinePassed = new Date() > new Date(event.registrationDeadline);

            return (
              <div key={event._id} className="glass glass-hover p-6 rounded-3xl flex flex-col justify-between h-[360px] relative overflow-hidden transition-all">
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  {/* Category Chip */}
                  <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider">
                    {event.category}
                  </span>

                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">{event.title}</h3>
                  
                  <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed">{event.description}</p>

                  <div className="space-y-2 pt-2 text-xs text-gray-500 font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-purple-500" />
                      <span>{new Date(event.date).toLocaleDateString()} at {event.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-500" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-blue-500" />
                      <span>
                        {event.currentParticipants} / {event.maxParticipants} Registered
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800/40 flex items-center justify-between">
                  {isFull ? (
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Sold Out</span>
                  ) : deadlinePassed ? (
                    <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Deadline Closed</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Registration Open</span>
                  )}

                  <Link
                    to={`/events/${event._id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
