import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        toast.success('Welcome to Admin Portal!');
        navigate('/admin/dashboard');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass p-8 rounded-3xl border border-gray-800/80 relative z-10 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Portal</h1>
          <p className="text-sm text-gray-400">Platform Superuser Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oasis.com"
                className="w-full bg-gray-950/60 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-950/60 border border-gray-800/80 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Access Admin Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
