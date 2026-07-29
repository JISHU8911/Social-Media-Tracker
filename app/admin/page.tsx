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
  PlusCircle,
  MessageSquare,
  ArrowRight,
  Search,
  Clock,
  TrendingUp,
  Sparkles,
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPostForWhatsApp, setSelectedPostForWhatsApp] = useState<PostItem | null>(null);

  useEffect(() => {
    // Auth check
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/admin/login');
        return res.json();
      })
      .catch(() => router.push('/admin/login'));

    // Fetch analytics summary
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data?.summary) setSummary(data.summary);
      })
      .catch(() => {});

    // Fetch recent submissions for Activity Timeline widget
    fetch('/api/submissions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRecentSubmissions(data.slice(0, 5));
      })
      .catch(() => {});

    // Fetch posts
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-600 mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SIT Executive HQ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Employee social media engagement metrics and active post performance.
            </p>
          </div>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl btn-primary text-xs sm:text-sm shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Post</span>
          </Link>
        </div>

        {/* Executive Analytics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Posts */}
          <div className="sit-card p-5 space-y-2 relative overflow-hidden sit-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Posts
              </span>
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary ? summary.totalPosts : 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Active campaigns in SIT</p>
          </div>

          {/* Total Submissions */}
          <div className="sit-card p-5 space-y-2 relative overflow-hidden sit-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary ? summary.totalSubmissions : 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Recorded employee responses</p>
          </div>

          {/* Participated Employees */}
          <div className="sit-card p-5 space-y-2 relative overflow-hidden sit-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Participated Employees
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary ? summary.totalEmployeesParticipated : 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Unique active workforce</p>
          </div>

          {/* Total Interactions */}
          <div className="sit-card p-5 space-y-2 relative overflow-hidden sit-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Interactions
              </span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {summary ? summary.totalInteractions : 0}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Likes, comments, shares, etc.</p>
          </div>
        </div>

        {/* Activity Feed & Recent Submissions Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Posts List (2 Cols) */}
          <div className="lg:col-span-2 sit-card overflow-hidden shadow-sm space-y-4">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active Social Media Posts</h2>
                <p className="text-xs text-slate-500">
                  Manage tracking links and copy WhatsApp broadcast messages.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl sit-input text-xs font-medium"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs">Loading posts...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-2">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <p>No social media posts found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Post Details</th>
                      <th className="py-3.5 px-4 sm:px-6">Submissions</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                              {post.imageUrl ? (
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full flex items-center justify-center text-[9px] text-slate-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <Link
                                href={`/admin/posts/${post.id}`}
                                className="font-bold text-slate-900 hover:text-cyan-600 transition-colors line-clamp-1 text-xs sm:text-sm"
                              >
                                {post.title}
                              </Link>
                              <div className="text-[11px] text-slate-500 font-mono">
                                /post/{post.trackingCode}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                            {post._count.submissions} Submissions
                          </span>
                        </td>

                        <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedPostForWhatsApp(post)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold btn-secondary"
                          >
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activity Timeline Widget (1 Col) */}
          <div className="sit-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-cyan-600" />
                <span>Recent Submissions Feed</span>
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase">
                Real-time
              </span>
            </div>

            {recentSubmissions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent submission activity.</p>
            ) : (
              <div className="space-y-3.5">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.fullName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(sub.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-cyan-700">
                      {sub.designation?.designationName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Post: {sub.post?.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* WhatsApp Message Generator Modal */}
      {selectedPostForWhatsApp && (
        <WhatsAppModal
          post={selectedPostForWhatsApp}
          isOpen={Boolean(selectedPostForWhatsApp)}
          onClose={() => setSelectedPostForWhatsApp(null)}
        />
      )}
    </div>
  );
}
