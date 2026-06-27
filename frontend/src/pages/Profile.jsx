import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, KeyRound, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    year: user?.year?.toString() || '1',
    password: '',
    confirmPassword: '',
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

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
      };

      if (user.role === 'student') {
        payload.year = Number(formData.year);
      }

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await axios.put('/api/profile', payload);
      updateProfileState(response.data.data);
      
      // Clear password inputs
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Manage Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Review your credentials and update your department details.</p>
      </div>

      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Department
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3.5 text-gray-500" size={16} />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Academic Year (Students only) */}
            {user.role === 'student' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                  Academic Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm appearance-none"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            )}
          </div>

          <div className="border-t border-gray-850 pt-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Change Password (Optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={16} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep same"
                    className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm placeholder:text-gray-700"
                    minLength="6"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={16} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Leave blank to keep same"
                    className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm placeholder:text-gray-700"
                    minLength="6"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg flex items-center justify-center gap-2 transition-all text-sm w-fit"
          >
            <Save size={16} />
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
