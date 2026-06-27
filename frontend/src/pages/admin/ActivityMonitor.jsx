import React, { useEffect, useState } from 'react';
import { getActivityLogs } from '../../services/adminService';
import { Activity, Search, ChevronLeft, ChevronRight, Clock, User, Shield, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ActivityMonitor = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getActivityLogs(page, limit, search);
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pages || 1);
      }
    } catch (error) {
      toast.error('Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionBadgeStyle = (action) => {
    switch (action) {
      case 'NEW_STUDENT_REGISTRATION':
      case 'NEW_ORGANIZER_REGISTRATION':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CREATE_EVENT':
      case 'EVENT_REGISTRATION':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'UPDATE_EVENT':
      case 'ATTENDANCE_UPDATE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CERTIFICATE_UPLOAD':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE_EVENT':
      case 'DELETE_USER':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Activity Monitor</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time audit log of user registrations, event operations, and platform activity.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass p-4 rounded-2xl flex items-center justify-between gap-4 border border-gray-800/40">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search action, description, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </form>
      </div>

      {/* Activity Table */}
      <div className="glass rounded-2xl border border-gray-800/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Fetching platform activity audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 uppercase text-xs text-gray-400 font-bold border-b border-gray-800/60">
                <tr>
                  <th className="px-6 py-4">Action Type</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-800/20 transition-all">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getActionBadgeStyle(log.action)}`}>
                        <Tag size={12} />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{log.user?.name || 'System User'}</p>
                      <p className="text-xs text-gray-500">{log.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs uppercase font-bold text-gray-400">
                      {log.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-500" />
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-gray-900/40 border-t border-gray-800/60 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 disabled:opacity-40 text-gray-300 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-2 rounded-xl bg-gray-800/60 hover:bg-gray-700 disabled:opacity-40 text-gray-300 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitor;
