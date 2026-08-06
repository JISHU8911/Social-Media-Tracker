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
import {
  BarChart3,
  Users,
  CheckCircle,
  Activity,
  Sparkles,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
} from 'lucide-react';

interface PlatformMetric {
  totalInteractions: number;
  participationPercent: number;
  dailyActivity: { day: string; count: number }[];
  weeklyActivity: { week: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
}

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
  platformAnalytics?: Record<string, PlatformMetric>;
}

const PLATFORM_COLORS = ['#1877F2', '#E4405F', '#0A66C2', '#1DA1F2', '#25D366'];
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

  // Platform active trend timeframes
  const [platformTimeframes, setPlatformTimeframes] = useState<
    Record<string, 'daily' | 'weekly' | 'monthly'>
  >({
    Facebook: 'daily',
    Instagram: 'daily',
    LinkedIn: 'daily',
    X: 'daily',
    WhatsApp: 'daily',
  });

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

  const platformAnalytics = data?.platformAnalytics || {};

  const platformConfigs = [
    {
      key: 'Facebook',
      label: 'Facebook Analytics',
      icon: Facebook,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      barColor: '#1877F2',
    },
    {
      key: 'Instagram',
      label: 'Instagram Analytics',
      icon: Instagram,
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      barColor: '#E4405F',
    },
    {
      key: 'LinkedIn',
      label: 'LinkedIn Analytics',
      icon: Linkedin,
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-700',
      barColor: '#0A66C2',
    },
    {
      key: 'X',
      label: 'X (Twitter) Analytics',
      icon: Twitter,
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      textColor: 'text-slate-800',
      barColor: '#1DA1F2',
    },
    {
      key: 'WhatsApp',
      label: 'WhatsApp Broadcast Analytics',
      icon: MessageSquare,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      barColor: '#25D366',
    },
  ];

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
            Aggregated workforce interaction metrics and platform-specific performance breakdown.
          </p>
        </div>

        {/* Global Stats Grid */}
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
            <span className="text-[10px] text-[#748D92] font-semibold">Aggregated Digital Actions</span>
          </div>
        </div>

        {/* Global Distribution Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Distribution Pie Chart */}
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#212A31]">Platform Submissions Distribution</h2>
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

        {/* SEPARATE PLATFORM-SPECIFIC ANALYTICS SECTION */}
        <section className="space-y-6 pt-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#212A31]">Platform-Specific Analytics</h2>
            <p className="text-xs text-[#2E3944] font-medium mt-0.5">
              Individual channel engagement rates, total interactions, participation percentages, and trend activity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformConfigs.map((plat) => {
              const pData: PlatformMetric = platformAnalytics[plat.key] || {
                totalInteractions: 0,
                participationPercent: 0,
                dailyActivity: [],
                weeklyActivity: [],
                monthlyActivity: [],
              };

              const timeframe = platformTimeframes[plat.key] || 'daily';

              let chartData: any[] = [];
              let xKey = 'day';
              if (timeframe === 'daily') {
                chartData = pData.dailyActivity || [];
                xKey = 'day';
              } else if (timeframe === 'weekly') {
                chartData = pData.weeklyActivity || [];
                xKey = 'week';
              } else {
                chartData = pData.monthlyActivity || [];
                xKey = 'month';
              }

              const IconComp = plat.icon;

              return (
                <div
                  key={plat.key}
                  className="sit-card p-5 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#748D92]/30 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-xl ${plat.bgColor} ${plat.textColor} border ${plat.borderColor}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-extrabold text-[#212A31]">{plat.label}</h3>
                      </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#D3D9D4]/30 border border-[#748D92]/30">
                        <span className="text-[10px] font-bold text-[#2E3944] uppercase tracking-wider block">
                          Total Interactions
                        </span>
                        <div className="text-lg font-extrabold text-[#212A31] mt-0.5">
                          {pData.totalInteractions}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#D3D9D4]/30 border border-[#748D92]/30">
                        <span className="text-[10px] font-bold text-[#2E3944] uppercase tracking-wider block">
                          Participation Rate
                        </span>
                        <div className="text-lg font-extrabold text-[#124E66] mt-0.5">
                          {pData.participationPercent}%
                        </div>
                      </div>
                    </div>

                    {/* Timeframe Selector & Trend Chart */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2E3944] uppercase">
                          Activity Trend
                        </span>
                        <div className="flex items-center gap-1 bg-[#D3D9D4]/50 p-0.5 rounded-lg border border-[#748D92]/30">
                          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
                            <button
                              key={tf}
                              onClick={() =>
                                setPlatformTimeframes((prev) => ({ ...prev, [plat.key]: tf }))
                              }
                              className={`px-2 py-0.5 text-[9px] font-bold rounded capitalize transition-all ${
                                timeframe === tf
                                  ? 'bg-[#124E66] text-white shadow-xs'
                                  : 'text-[#2E3944] hover:text-[#212A31]'
                              }`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Chart Container */}
                      <div className="h-44 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <XAxis dataKey={xKey} stroke="#748D92" fontSize={10} tickLine={false} />
                            <YAxis stroke="#748D92" fontSize={10} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#212A31',
                                borderColor: '#748D92',
                                borderRadius: '8px',
                                color: '#ffffff',
                                fontSize: '11px',
                              }}
                            />
                            <Bar dataKey="count" fill={plat.barColor} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
