'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, Users, CheckCircle, Activity, Sparkles } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalPosts: number;
    totalSubmissions: number;
    totalEmployeesParticipated: number;
    totalInteractions: number;
  };
  platformData: { name: string; count: number }[];
  interactionData: { name: string; count: number }[];
  postMetrics: { title: string; submissions: number }[];
}

const PLATFORM_COLORS = ['#124E66', '#748D92', '#2E3944', '#212A31'];
const INTERACTION_COLORS = [
  '#124E66',
  '#748D92',
  '#2E3944',
  '#212A31',
  '#0E3E52',
  '#242D36',
  '#192026',
];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/login');
      })
      .catch(() => router.push('/login'));

    fetch('/api/analytics')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="sit-card p-8 text-center text-xs font-bold text-[#2E3944] animate-pulse">
            Compiling SIT Analytics Engine Data...
          </div>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalPosts: 0,
    totalSubmissions: 0,
    totalEmployeesParticipated: 0,
    totalInteractions: 0,
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#124E66] mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Analytical Engine Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
            Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
            Aggregated workforce interaction metrics across social media platforms.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sit-card-stat p-5 space-y-1">
            <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider block">
              Total Campaigns
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {summary.totalPosts}
            </div>
            <span className="text-[10px] text-[#748D92] font-semibold">Active Posts</span>
          </div>

          <div className="sit-card-stat p-5 space-y-1">
            <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider block">
              Total Submissions
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {summary.totalSubmissions}
            </div>
            <span className="text-[10px] text-[#748D92] font-semibold">Logged Member Responses</span>
          </div>

          <div className="sit-card-stat p-5 space-y-1">
            <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider block">
              Participated Members
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {summary.totalEmployeesParticipated}
            </div>
            <span className="text-[10px] text-[#748D92] font-semibold">Unique Active Users</span>
          </div>

          <div className="sit-card-stat p-5 space-y-1">
            <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider block">
              Total Interactions
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {summary.totalInteractions}
            </div>
            <span className="text-[10px] text-[#748D92] font-semibold">Aggregated Likes, Shares & Comments</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Distribution Pie Chart */}
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#212A31]">Platform Distribution</h2>
              <span className="text-xs font-bold text-[#124E66]">Channels</span>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.platformData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent, value }) => {
                      if (!value || !percent || percent === 0) return null;
                      return `${name} (${(percent * 100).toFixed(0)}%)`;
                    }}
                  >
                    {(data?.platformData || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#212A31',
                      borderColor: '#748D92',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interaction Types Bar Chart */}
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#212A31]">Action Types Breakdown</h2>
              <span className="text-xs font-bold text-[#124E66]">Engagement</span>
            </div>

            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.interactionData || []}>
                  <XAxis dataKey="name" stroke="#748D92" fontSize={11} tickLine={false} />
                  <YAxis stroke="#748D92" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#212A31',
                      borderColor: '#748D92',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#124E66" radius={[6, 6, 0, 0]}>
                    {(data?.interactionData || []).map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={INTERACTION_COLORS[index % INTERACTION_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Performing Posts Table */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#212A31]">Top Performing Campaign Posts</h2>
            <span className="text-xs font-bold text-[#124E66]">Rankings</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#748D92]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#212A31] text-white font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Campaign Title</th>
                  <th className="px-4 py-3 text-right">Submissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#748D92]/30 font-medium">
                {(data?.postMetrics || []).map((post, idx) => (
                  <tr key={idx} className="hover:bg-[#D3D9D4]/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#124E66]">#{idx + 1}</td>
                    <td className="px-4 py-3 text-[#212A31] font-bold">{post.title}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#212A31]">
                      {post.submissions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
