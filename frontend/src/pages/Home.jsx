import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Award, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-purple-500/20">
            O
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Oasis
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
          {user ? (
            <Link
              to={user.role === 'organizer' ? '/organizer/dashboard' : '/student/dashboard'}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-lg shadow-purple-500/20 transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-emerald-500 text-white shadow-lg shadow-purple-500/20 transition-all"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-8">
          <Zap size={14} />
          <span>One Platform for Every Campus Event</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Manage College Events <br />
          <span className="gradient-text">Without the Chaos</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12">
          Simplify registrations, coordinate attendance, upload certificates, and analyze participation. 
          Oasis replaces fragmented chats and forms with a single unified workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 w-full max-w-md">
          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-xl shadow-purple-500/10 flex items-center justify-center gap-2 transition-all"
          >
            Explore Events
            <ChevronRight size={18} />
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 rounded-2xl font-bold bg-gray-900 border border-gray-800 hover:bg-gray-800 flex items-center justify-center gap-2 transition-all"
          >
            Join as Organizer
          </Link>
        </div>

        {/* Highlight Stats / Cards */}
        <section id="features" className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-10">
          <div className="glass glass-hover p-8 rounded-3xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Centralized Discovery</h3>
            <p className="text-gray-400 leading-relaxed">
              Students can browse active events, search, and register in just a click. Say goodbye to scattered links.
            </p>
          </div>

          <div className="glass glass-hover p-8 rounded-3xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Organizer Dashboard</h3>
            <p className="text-gray-400 leading-relaxed">
              Create events, track live registration numbers, download attendee lists, and record dynamic event attendance.
            </p>
          </div>

          <div className="glass glass-hover p-8 rounded-3xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Certificates</h3>
            <p className="text-gray-400 leading-relaxed">
              Organizers upload participation certificates directly to Cloudinary. Verified students download their copies instantly.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950/40 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Oasis Event Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
