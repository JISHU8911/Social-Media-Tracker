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
  const [orgName, setOrgName] = useState('ClubHQ');

  const [selectedPostForWhatsApp, setSelectedPostForWhatsApp] = useState<PostItem | null>(null);

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
      const [analyticsRes, postsRes, submissionsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/posts'),
        fetch('/api/submissions'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setSummary(data.summary || null);
      }
      if (postsRes.ok) {
        const data = await postsRes.json();
        if (Array.isArray(data)) setPosts(data);
      }
      if (submissionsRes.ok) {
        const data = await submissionsRes.json();
        if (Array.isArray(data)) setRecentSubmissions(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#E64833] mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{orgName} Executive Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#244855] tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#244855]/80 font-medium">
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

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Posts */}
          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                Total Posts
              </span>
              <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
              {summary ? summary.totalPosts : 0}
            </div>
            <p className="text-[11px] text-[#244855]/70 font-medium">Active campaign posts</p>
          </div>

          {/* Total Submissions */}
          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                Total Submissions
              </span>
              <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
              {summary ? summary.totalSubmissions : 0}
            </div>
            <p className="text-[11px] text-[#244855]/70 font-medium">Recorded employee responses</p>
          </div>

          {/* Participated Employees */}
          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                Participated Employees
              </span>
              <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
              {summary ? summary.totalEmployeesParticipated : 0}
            </div>
            <p className="text-[11px] text-[#244855]/70 font-medium">Unique active workforce</p>
          </div>

          {/* Total Interactions */}
          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                Total Interactions
              </span>
              <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
              {summary ? summary.totalInteractions : 0}
            </div>
            <p className="text-[11px] text-[#244855]/70 font-medium">Aggregated digital actions</p>
          </div>
        </div>

        {/* Quick Actions & Recent Submissions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Posts Management Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#244855]">Recent Posts</h2>
                <p className="text-xs text-[#244855]/80 font-medium">
                  Track and distribute social campaigns.
                </p>
              </div>

              <div className="relative max-w-xs">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#244855]/40" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl sit-input text-xs w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="sit-card p-12 text-center text-xs font-semibold text-[#244855]">
                Loading campaign posts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="sit-card p-12 text-center space-y-3">
                <FileText className="h-10 w-10 text-[#244855]/40 mx-auto" />
                <h3 className="text-sm font-bold text-[#244855]">No Campaign Posts Found</h3>
                <p className="text-xs text-[#244855]/80">Create your first post to start tracking employee social interaction.</p>
                <Link href="/admin/posts/new" className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs">
                  <PlusCircle className="h-4 w-4" /> Create Post
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredPosts.slice(0, 6).map((post) => (
                  <div
                    key={post.id}
                    className="sit-card p-5 bg-white border border-[#244855]/15 rounded-2xl space-y-4 hover:border-[#244855]/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFA896]/20 text-[#244855] border border-[#244855]/10">
                          ID: {post.trackingCode}
                        </span>
                        <span className="text-[11px] font-bold text-[#E64833] flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {post._count.submissions} Submissions
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-[#244855] line-clamp-2">
                        {post.title}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-[#244855]/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedPostForWhatsApp(post)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold btn-primary flex items-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Alert
                      </button>

                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold btn-secondary flex items-center gap-1"
                      >
                        View Details <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed / Submissions Widget */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-[#244855]">Recent Activity</h2>
              <p className="text-xs text-[#244855]/80 font-medium">
                Live employee engagement logging feed.
              </p>
            </div>

            <div className="sit-card p-5 bg-white border border-[#244855]/15 rounded-2xl space-y-4 shadow-soft">
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#244855]/70 font-medium">
                  No recent activity logged yet.
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-[#244855]/10">
                  {recentSubmissions.map((sub, i) => (
                    <div key={sub.id || i} className={`${i > 0 ? 'pt-3' : ''} flex items-start space-x-3`}>
                      <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833] shrink-0 mt-0.5">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#244855] truncate">
                          {sub.user?.name || sub.userName || 'Employee'}
                        </p>
                        <p className="text-[11px] text-[#244855]/80 truncate font-medium">
                          Submitted proof for {sub.post?.title || 'Campaign Post'}
                        </p>
                        <span className="text-[10px] text-[#244855]/60 flex items-center gap-1 mt-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-[#244855]/10">
                <Link
                  href="/admin/analytics"
                  className="w-full py-2.5 rounded-xl btn-secondary text-xs font-bold text-center block"
                >
                  View Full Analytics Engine
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Modal */}
        {selectedPostForWhatsApp && (
          <WhatsAppModal
            post={selectedPostForWhatsApp}
            onClose={() => setSelectedPostForWhatsApp(null)}
          />
        )}
      </main>
    </div>
  );
}
