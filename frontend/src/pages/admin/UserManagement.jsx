import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, updateUserStatus, deleteUser, updateUser } from '../../services/adminService';
import { Search, Filter, Eye, Edit, Trash2, Shield, UserCheck, ToggleLeft, ToggleRight, AlertTriangle, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [editModalUser, setEditModalUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', department: '', role: '', year: 1 });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers(roleFilter, search);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      const res = await updateUserStatus(user._id, newStatus);
      if (res.success) {
        toast.success(res.message);
        setUsers(users.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u)));
      }
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    try {
      const res = await deleteUser(deleteModalUser._id);
      if (res.success) {
        toast.success(res.message);
        setUsers(users.filter((u) => u._id !== deleteModalUser._id));
        setDeleteModalUser(null);
      }
    } catch (error) {
      toast.error('Failed to delete user.');
    }
  };

  const openEditModal = (user) => {
    setEditModalUser(user);
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      department: user.department || '',
      role: user.role || 'student',
      year: user.year || 1,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUser(editModalUser._id, editFormData);
      if (res.success) {
        toast.success('User updated successfully!');
        setUsers(users.map((u) => (u._id === editModalUser._id ? res.data : u)));
        setEditModalUser(null);
      }
    } catch (error) {
      toast.error('Failed to update user.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage student accounts, organizers, and administration permissions.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800/40">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-950/60 border border-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass rounded-2xl border border-gray-800/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading platform users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found matching your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 uppercase text-xs text-gray-400 font-bold border-b border-gray-800/60">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-800/20 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        u.role === 'organizer' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-medium">
                      {u.department} {u.role === 'student' && u.year ? `(Yr ${u.year})` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          u.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.isActive !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        {u.isActive !== false ? 'Active' : 'Deactivated'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-300 hover:text-white transition-all"
                          title="View Profile History"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-lg bg-gray-800/60 hover:bg-blue-600/20 text-gray-300 hover:text-blue-400 transition-all"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModalUser(u)}
                          className="p-2 rounded-lg bg-gray-800/60 hover:bg-rose-600/20 text-gray-300 hover:text-rose-400 transition-all"
                          title="Delete User"
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
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-3xl border border-gray-800 w-full max-w-lg space-y-6 relative animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Edit User Information</h3>
              <button onClick={() => setEditModalUser(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {editFormData.role === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Year</label>
                    <select
                      value={editFormData.year}
                      onChange={(e) => setEditFormData({ ...editFormData, year: Number(e.target.value) })}
                      className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white"
                    >
                      <option value={1}>Year 1</option>
                      <option value={2}>Year 2</option>
                      <option value={3}>Year 3</option>
                      <option value={4}>Year 4</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
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
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass p-6 rounded-3xl border border-gray-800 w-full max-w-md text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Delete User Account?</h3>
            <p className="text-sm text-gray-400">
              Are you sure you want to delete <strong className="text-white">{deleteModalUser.name}</strong>? This operation cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-gray-800/40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
