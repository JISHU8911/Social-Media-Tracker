'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import WhatsAppModal from '@/components/WhatsAppModal';
import {
  FileText,
  Users,
  CheckCircle,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  BarChart3,
  Trophy,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Image as ImageIcon,
} from 'lucide-react';

interface SummaryData {
  totalPosts: number;
  totalSubmissions: number;
  totalEmployeesParticipated: number;
  totalInteractions: number;
}

interface PostItem {
  id: string;
  title: string;
  imageUrl: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  trackingCode: string;
  createdBy: string;
  createdAt: string;
  _count: { submissions: number };
}

interface UpcomingEntry {
  id: string;
  title: string;
  date: string;
  targetTime: string;
  status: string;
}

interface TopContributor {
  rank: number;
  badge: string;
  name: string;
  designation: string;
  totalInteractions: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [upcomingEntries, setUpcomingEntries] = useState<UpcomingEntry[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('ClubHQ');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/login');
        return res.json();
      })
      .then((data) => {
        if (data?.user?.organizationName) setOrgName(data.user.organizationName);
      })
      .catch(() => router.push('/login'));

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, postsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/posts'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setSummary(data.summary || null);
        if (Array.isArray(data.upcomingEntries)) setUpcomingEntries(data.upcomingEntries);
        if (Array.isArray(data.topContributors)) setTopContributors(data.topContributors);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        if (Array.isArray(data)) setPosts(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'POSTED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">POSTED</span>;
      case 'POSTER_READY':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">MEDIA READY</span>;
      case 'DELAYED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">DELAYED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">CANCELLED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300">PLANNED</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Overview Banner */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#E64833] mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{orgName} Executive Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#244855] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#244855]/80 font-medium mt-1">
            Quick executive insights, upcoming social posts, recent campaigns, and top contributor rankings.
          </p>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RECENT POSTS CARD (Latest 3 Posts) */}
          <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-5 shadow-soft flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244855]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-[#E64833]" />
                  <h2 className="text-base font-extrabold text-[#244855]">Recent Posts</h2>
                </div>
                <Link
                  href="/admin/posts"
                  className="text-xs font-extrabold text-[#E64833] hover:underline inline-flex items-center gap-1"
                >
                  <span>See All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs font-semibold text-[#244855]/70">
                  Loading recent campaign posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#244855]/70 font-medium">
                  No campaign posts published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/admin/posts/${post.id}`}
                      className="p-3.5 rounded-xl border border-[#244855]/15 hover:border-[#E64833] transition-all bg-[#FFF8F5]/40 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#244855]/10 overflow-hidden shrink-0 border border-[#244855]/10 flex items-center justify-center">
                          {post.imageUrl ? (
                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-[#244855]/40" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="font-extrabold text-xs text-[#244855] truncate group-hover:text-[#E64833] transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#244855]/70">
                            <span className="font-mono">Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className="font-bold text-[#E64833]">• {post._count?.submissions || 0} Submissions</span>
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            {post.facebookUrl && <Facebook className="w-3 h-3 text-blue-600" />}
                            {post.instagramUrl && <Instagram className="w-3 h-3 text-pink-600" />}
                            {post.linkedinUrl && <Linkedin className="w-3 h-3 text-sky-600" />}
                            {post.xUrl && <Twitter className="w-3 h-3 text-slate-800" />}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#244855]/40 group-hover:text-[#E64833] shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING POSTS CARD (Next 3 Calendar Entries) */}
          <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-5 shadow-soft flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244855]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-[#E64833]" />
                  <h2 className="text-base font-extrabold text-[#244855]">Upcoming Posts</h2>
                </div>
                <Link
                  href="/admin/calendar"
                  className="text-xs font-extrabold text-[#E64833] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs font-semibold text-[#244855]/70">
                  Loading upcoming calendar posts...
                </div>
              ) : upcomingEntries.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#244855]/70 font-medium">
                  No upcoming posts scheduled on Social Calendar.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEntries.slice(0, 3).map((entry) => (
                    <Link
                      key={entry.id}
                      href="/admin/calendar"
                      className="p-3.5 rounded-xl border border-[#244855]/15 hover:border-[#E64833] transition-all bg-[#FFF8F5]/40 flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-extrabold text-xs text-[#244855] truncate group-hover:text-[#E64833] transition-colors">
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#244855]/70">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#E64833]" />
                            {new Date(entry.date).toLocaleDateString()} ({entry.targetTime})
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(entry.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ANALYTICS PREVIEW CARD */}
          <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-5 shadow-soft flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244855]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-[#E64833]" />
                  <h2 className="text-base font-extrabold text-[#244855]">Analytics Overview</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFA896]/20 text-[#E64833]">
                  Real-time
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-[#FFF8F5] border border-[#244855]/10 space-y-1">
                  <span className="text-[11px] font-bold text-[#244855]/70 uppercase tracking-wider block">
                    Total Posts
                  </span>
                  <div className="text-2xl font-extrabold text-[#244855]">
                    {summary ? summary.totalPosts : 0}
                  </div>
                  <p className="text-[10px] text-[#244855]/60">Published campaigns</p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFF8F5] border border-[#244855]/10 space-y-1">
                  <span className="text-[11px] font-bold text-[#244855]/70 uppercase tracking-wider block">
                    Total Interactions
                  </span>
                  <div className="text-2xl font-extrabold text-[#E64833]">
                    {summary ? summary.totalInteractions : 0}
                  </div>
                  <p className="text-[10px] text-[#244855]/60">Logged member actions</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#244855]/10">
              <Link
                href="/admin/analytics"
                className="w-full py-2.5 rounded-xl btn-secondary text-xs font-bold text-center block shadow-sm hover:bg-[#244855] hover:text-white transition-all"
              >
                View Full Analytics &rarr;
              </Link>
            </div>
          </div>

          {/* TOP CONTRIBUTORS LEADERBOARD CARD */}
          <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-5 shadow-soft flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#244855]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-[#E64833]" />
                  <h2 className="text-base font-extrabold text-[#244855]">Top Contributors</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Top 5 Members
                </span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs font-semibold text-[#244855]/70">
                  Loading leaderboard rankings...
                </div>
              ) : topContributors.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#244855]/70 font-medium">
                  No engagement interactions recorded yet for leaderboard.
                </div>
              ) : (
                <div className="space-y-2.5 divide-y divide-[#244855]/10">
                  {topContributors.map((c, idx) => (
                    <div
                      key={idx}
                      className={`${idx > 0 ? 'pt-2.5' : ''} flex items-center justify-between gap-3`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-lg shrink-0">{c.badge}</span>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-[#244855] truncate">{c.name}</p>
                          <p className="text-[10px] text-[#244855]/70 truncate font-medium">{c.designation}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#FFA896]/20 text-[#E64833] text-xs font-extrabold font-mono shrink-0">
                        {c.totalInteractions} Interactions
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
