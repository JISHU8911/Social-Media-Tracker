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

const PLATFORM_COLORS = ['#3b82f6', '#ec4899', '#0284c7', '#64748b'];
const INTERACTION_COLORS = [
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#0284c7',
  '#6366f1',
];

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/admin/login');
      })
      .catch(() => router.push('/admin/login'));

    fetch('/api/analytics')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-xs font-semibold text-slate-500">Loading SIT analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SIT Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Engagement Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time engagement breakdown across social media platforms and specific employee actions.
          </p>
        </div>

        {/* Summary KPI Cards */}
        {data?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="sit-card p-5 space-y-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {data.summary.totalSubmissions}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Recorded employee responses</p>
            </div>

            <div className="sit-card p-5 space-y-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Unique Participants
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {data.summary.totalEmployeesParticipated}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Workforce active participation</p>
            </div>

            <div className="sit-card p-5 space-y-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Actions Logged
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600">
                {data.summary.totalInteractions}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Likes, comments, shares, etc.</p>
            </div>

            <div className="sit-card p-5 space-y-2 border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Active Posts
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                {data.summary.totalPosts}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Active SIT post campaigns</p>
            </div>
          </div>
        )}

        {/* Charts Row 1: Platform Distribution & Interaction Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Distribution Pie Chart */}
          <div className="sit-card p-6 border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              <span>Platform Engagement Metrics</span>
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of total submissions per social media platform.
            </p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.platformData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
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
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Interaction Breakdown Bar Chart */}
          <div className="sit-card p-6 border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span>Interaction Action Counts</span>
            </h3>
            <p className="text-xs text-slate-500">
              Counts of Likes, Comments, Shares, Stories, Reposts, Replies, & Quote Posts.
            </p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.interactionData || []}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {(data?.interactionData || []).map((entry, index) => (
                      <Cell
                        key={`cell-bar-${index}`}
                        fill={INTERACTION_COLORS[index % INTERACTION_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2: Post Participation Breakdown */}
        <div className="sit-card p-6 border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Top Posts Participation Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Number of submissions recorded per post campaign.
          </p>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.postMetrics || []} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="title" type="category" stroke="#64748b" fontSize={11} width={180} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="submissions" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
