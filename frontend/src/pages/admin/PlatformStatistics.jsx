import React, { useEffect, useState } from 'react';
import { getPlatformStatistics } from '../../services/adminService';
import { Users, Calendar, Award, Trophy, Star, TrendingUp, BarChart2, PieChart as PieChartIcon, Activity, AlertCircle } from 'lucide-react';

const COLORS = [
  'bg-purple-500 text-purple-400 border-purple-500/30',
  'bg-emerald-500 text-emerald-400 border-emerald-500/30',
  'bg-amber-500 text-amber-400 border-amber-500/30',
  'bg-pink-500 text-pink-400 border-pink-500/30',
  'bg-blue-500 text-blue-400 border-blue-500/30',
  'bg-indigo-500 text-indigo-400 border-indigo-500/30',
];

const HEX_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#6366f1'];

const PlatformStatistics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPlatformStatistics();
        if (res && res.success) {
          setData(res.data);
        } else {
          setErrorMsg(res?.message || 'Failed to fetch statistics data.');
        }
      } catch (error) {
        console.error('Failed to fetch platform statistics', error);
        setErrorMsg(error.response?.data?.message || error.message || 'Error connecting to statistics API.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 animate-pulse flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading deep platform analytics...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="glass p-8 rounded-3xl border border-rose-500/30 text-center max-w-lg mx-auto space-y-4 my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">Unable to Load Statistics</h3>
        <p className="text-sm text-gray-400">{errorMsg}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};

  const usersPerMonth = Array.isArray(charts?.usersPerMonth) ? charts.usersPerMonth : [];
  const eventsPerMonth = Array.isArray(charts?.eventsPerMonth) ? charts.eventsPerMonth : [];
  const categoryDistribution = Array.isArray(charts?.categoryDistribution) ? charts.categoryDistribution : [];
  const participationTrends = Array.isArray(charts?.participationTrends) ? charts.participationTrends : [];

  const statCards = [
    { title: 'Total Users', val: summary.totalUsers ?? 0, sub: `Students: ${summary.totalStudents ?? 0} | Org: ${summary.totalOrganizers ?? 0}`, icon: Users, color: 'text-purple-400' },
    { title: 'Total Events', val: summary.totalEvents ?? 0, sub: `Active: ${summary.activeEvents ?? 0} | Done: ${summary.completedEvents ?? 0}`, icon: Calendar, color: 'text-emerald-400' },
    { title: 'Total Registrations', val: summary.totalRegistrations ?? 0, sub: `Avg per Event: ${summary.avgParticipation ?? 0}`, icon: TrendingUp, color: 'text-blue-400' },
    { title: 'Certificates Issued', val: summary.totalCertificatesIssued ?? 0, sub: `Verified completions`, icon: Award, color: 'text-amber-400' },
    { title: 'Top Category', val: summary.mostPopularCategory || 'N/A', sub: `Most frequent event type`, icon: Star, color: 'text-rose-400' },
    { title: 'Top Organizer', val: summary.mostActiveOrganizer || 'N/A', sub: `Highest event publications`, icon: Trophy, color: 'text-indigo-400' },
  ];

  // Helper for Bar & Line calculations
  const maxEvents = Math.max(...eventsPerMonth.map((d) => d.count), 1);
  const maxUsers = Math.max(...usersPerMonth.map((d) => d.count), 1);
  const maxPart = Math.max(...participationTrends.map((d) => d.count), 1);
  const totalCatCount = categoryDistribution.reduce((acc, c) => acc + c.count, 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Platform Statistics & Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Deep insights into growth, participation trends, and engagement across Oasis.</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass p-6 rounded-2xl border border-gray-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{card.title}</p>
                <Icon className={card.color} size={22} />
              </div>
              <h3 className="text-3xl font-black text-white">{card.val}</h3>
              <p className="text-xs text-gray-500 font-semibold">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. User Registration Growth (Custom Line Chart) */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-purple-400" />
            <h3 className="text-lg font-bold text-white">User Registration Growth</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-gray-800 px-2">
            {usersPerMonth.map((item, idx) => {
              const heightPct = Math.max((item.count / maxUsers) * 100, 8);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
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

        {/* 2. Events Created Comparison (Custom Bar Chart) */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <BarChart2 size={20} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Events Created Comparison</h3>
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

        {/* 3. Event Category Breakdown (Custom Visual Breakdown) */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <PieChartIcon size={20} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Event Category Breakdown</h3>
          </div>
          {categoryDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm italic">
              No event category data recorded yet.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {categoryDistribution.map((cat, idx) => {
                const pct = Math.round((cat.count / totalCatCount) * 100);
                const colorClass = COLORS[idx % COLORS.length];
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

        {/* 4. Student Engagement Trend (Custom Area / Bar Visual) */}
        <div className="glass p-6 rounded-2xl border border-gray-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-blue-400" />
            <h3 className="text-lg font-bold text-white">Student Engagement Trend</h3>
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

export default PlatformStatistics;
