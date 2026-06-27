import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, Building2, GraduationCap, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    year: '1',
  });
  const [error, setError] = useState('');
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
    setError('');

    try {
      // Prepare payload
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
      };

      if (formData.role === 'student') {
        payload.year = Number(formData.year);
      }

      console.log('Registering user with payload:', payload);
      const result = await register(payload);

      if (result.success) {
        toast.success('Registration successful!');
        if (formData.role === 'organizer') {
          navigate('/organizer/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Registration Catch Error:', err);
      const msg = err.response?.data?.message || err.message || 'An unexpected error occurred during registration.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 py-12 relative">
      {/* Background radial blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass max-w-md w-full p-8 rounded-3xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg mb-3">
            O
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-sans">Create Account</h2>
          <p className="text-gray-400 text-xs mt-1">Get started with Oasis campus management</p>
        </div>

        {error && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1 animate-fade-in">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.doe@college.edu"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all text-sm"
                minLength="6"
                required
              />
            </div>
          </div>

          {/* Department Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Department
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className="w-full bg-gray-950/40 border border-gray-800/80 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Role Dropdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                Join As
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-gray-950/60 border border-gray-800/80 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500 transition-all text-sm cursor-pointer"
              >
                <option value="student" className="bg-gray-900 text-white">Student</option>
                <option value="organizer" className="bg-gray-900 text-white">Organizer</option>
              </select>
            </div>

            {/* Academic Year - Only visible if student is selected */}
            {formData.role === 'student' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
                  Academic Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full bg-gray-950/60 border border-gray-800/80 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-purple-500 transition-all text-sm cursor-pointer"
                >
                  <option value="1" className="bg-gray-900 text-white">1st Year</option>
                  <option value="2" className="bg-gray-900 text-white">2nd Year</option>
                  <option value="3" className="bg-gray-900 text-white">3rd Year</option>
                  <option value="4" className="bg-gray-900 text-white">4th Year</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 disabled:opacity-60 text-white shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2 transition-all mt-6 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
