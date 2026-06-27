import React, { useEffect, useState } from 'react';
import { getAdminDashboardStats, getPlatformStatistics } from '../../services/adminService';
import { Users, UserCheck, ShieldCheck, Calendar, CheckCircle, Clock, FileText, TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = [
  'bg-purple-500 text-purple-400 border-purple-500/30',
  'bg-emerald-500 text-emerald-400 border-emerald-500/30',
  'bg-amber-500 text-amber-400 border-amber-500/30',
  'bg-pink-500 text-pink-400 border-pink-500/30',
  'bg-blue-500 text-blue-400 border-blue-500/30',
  'bg-indigo-500 text-indigo-400 border-indigo-500/30',
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, statRes] = await Promise.all([
          getAdminDashboardStats(),
          getPlatformStatistics(),
        ]);
        if (dashRes && dashRes.success) setStats(dashRes.data);
        if (statRes && statRes.success) setCharts(statRes.data.charts);
      } catch (error) {
        console.error('Failed to load admin dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-gray-800/40 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 glass rounded-2xl p-6 border border-gray-800/40"></div>
          ))}
        </div>
      </div>
    );
  }

  const usersPerMonth = Array.isArray(charts?.usersPerMonth) ? charts.usersPerMonth : [];
  const eventsPerMonth = Array.isArray(charts?.eventsPerMonth) ? charts.eventsPerMonth : [];
  const categoryDistribution = Array.isArray(charts?.categoryDistribution) ? charts.categoryDistribution : [];
  const participationTrends = Array.isArray(charts?.participationTrends) ? charts.participationTrends : [];

  const maxEvents = Math.max(...eventsPerMonth.map((d) => d.count), 1);
  const maxUsers = Math.max(...usersPerMonth.map((d) => d.count), 1);
  const maxPart = Math.max(...participationTrends.map((d) => d.count), 1);
  const totalCatCount = categoryDistribution.reduce((acc, c) => acc + c.count, 0) || 1;

  const cardItems = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { title: 'Total Students', value: stats?.totalStudents ?? 0, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { title: 'Total Organizers', value: stats?.totalOrganizers ?? 0, icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { title: 'Total Events', value: stats?.totalEvents ?? 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { title: 'Active Events', value: stats?.activeEvents ?? 0, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
    { title: 'Completed Events', value: stats?.completedEvents ?? 0, icon: CheckCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { title: 'Upcoming Events', value: stats?.upcomingEvents ?? 0, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { title: 'Total Registrations', value: stats?.totalRegistrations ?? 0, icon: FileText, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Admin Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Platform metrics and system activity analytics.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass p-6 rounded-2xl border border-gray-800/40 relative overflow-hidden group hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">{card.title}</p>
                  <h3 className="text-3xl font-black text-white mt-2">{card.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bg}`}>
                  <Icon className={card.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Registrations Trend */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">User Registrations per Month</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-gray-800 px-2">
            {usersPerMonth.map((item, idx) => {
              const heightPct = Math.max((item.count / maxUsers) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 border border-purple-500/30 text-white text-xs px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    {item.month}: <strong>{item.count} users</strong>
                  </div>
                  <div className="w-full max-w-[40px] flex items-end justify-center h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-xl transition-all duration-500 group-hover:from-purple-500 group-hover:to-indigo-300 shadow-lg shadow-purple-500/10"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold truncate w-full text-center">{item.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events Created Trend */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <BarChart2 size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Events Created per Month</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-gray-800 px-2">
            {eventsPerMonth.map((item, idx) => {
              const heightPct = Math.max((item.count / maxEvents) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 border border-emerald-500/30 text-white text-xs px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    {item.month}: <strong>{item.count} events</strong>
                  </div>
                  <div className="w-full max-w-[40px] flex items-end justify-center h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-lg shadow-emerald-500/10"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold truncate w-full text-center">{item.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Category Distribution */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <PieChartIcon size={20} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Event Category Distribution</h3>
          </div>
          {categoryDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm italic">
              No event category data recorded yet.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {categoryDistribution.map((cat, idx) => {
                const pct = Math.round((cat.count / totalCatCount) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-gray-300">{cat.category}</span>
                      <span className="text-white font-bold">{cat.count} events ({pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-gray-800">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Student Participation Trends */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">Student Participation Trends</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-gray-800 px-2">
            {participationTrends.map((item, idx) => {
              const heightPct = Math.max((item.count / maxPart) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 border border-blue-500/30 text-white text-xs px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-xl">
                    {item.month}: <strong>{item.count} registrations</strong>
                  </div>
                  <div className="w-full max-w-[40px] flex items-end justify-center h-full">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl transition-all duration-500 group-hover:from-blue-500 group-hover:to-cyan-300 shadow-lg shadow-blue-500/10"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 font-semibold truncate w-full text-center">{item.month.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
