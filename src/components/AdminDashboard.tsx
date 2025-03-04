import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';
import { Loader2, Users, Clock, Eye, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DailyStats {
  date: string;
  visits: number;
  unique_visitors: number;
  avg_session_duration: number;
}

interface PageViewStats {
  page_path: string;
  view_count: number;
  avg_time_spent: number;
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Fetch daily statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    ['admin-stats', timeRange],
    async () => {
      const timeFilter = {
        '24h': '1 day',
        '7d': '7 days',
        '30d': '30 days'
      }[timeRange];

      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', `now() - interval '${timeFilter}'`)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  );

  // Fetch total user count
  const { data: userCount } = useQuery('total-users', async () => {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  });

  // Fetch active sessions
  const { data: activeSessions } = useQuery(
    'active-sessions',
    async () => {
      const { count, error } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .is('session_end', null);

      if (error) throw error;
      return count || 0;
    },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch popular pages
  const { data: popularPages } = useQuery(
    'popular-pages',
    async () => {
      const { data, error } = await supabase
        .rpc('get_popular_pages');

      if (error) throw error;
      return data || [];
    }
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const todayStats = stats?.[stats.length - 1] || { visits: 0, unique_visitors: 0, avg_session_duration: 0 };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={userCount}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="Active Sessions"
          value={activeSessions}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          title="Today's Visits"
          value={todayStats.visits}
          icon={<Eye className="w-6 h-6" />}
        />
        <StatCard
          title="Avg. Session Duration"
          value={`${Math.round(todayStats.avg_session_duration / 60)}m`}
          icon={<BarChart3 className="w-6 h-6" />}
        />
      </div>

      {/* Time Range Selector */}
      <div className="mb-8">
        <div className="flex gap-4">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as '24h' | '7d' | '30d')}
              className={`px-4 py-2 rounded-md ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors Chart */}
      <div className="h-[400px] mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Visitor Traffic</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
              stroke="#9CA3AF"
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="unique_visitors"
              name="Unique Visitors"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="visits"
              name="Total Visits"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Pages */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Popular Pages</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 text-left">Page</th>
                <th className="py-3 text-right">Views</th>
                <th className="py-3 text-right">Avg. Time</th>
              </tr>
            </thead>
            <tbody>
              {popularPages?.map((page: PageViewStats) => (
                <tr key={page.page_path} className="border-b border-gray-700">
                  <td className="py-3">{page.page_path}</td>
                  <td className="py-3 text-right">{page.view_count}</td>
                  <td className="py-3 text-right">
                    {Math.round(page.avg_time_spent)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  );
} 