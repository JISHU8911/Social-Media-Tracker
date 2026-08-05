'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  FileText,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  CheckCircle2,
  Building2,
  User,
  ShieldCheck,
  UserCheck,
  Building,
  Check,
} from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  imageUrl: string;
  caption?: string | null;
  trackingCode: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  createdAt: string;
}

interface SubmissionItem {
  id: string;
  fullName: string;
  designation: { designationName: string };
  post: { title: string; trackingCode: string };
  facebookActions?: string | null;
  instagramActions?: string | null;
  linkedinActions?: string | null;
  xActions?: string | null;
  updatedAt: string;
}

export default function MemberDashboardPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [history, setHistory] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId?: string | null;
    organizationName?: string | null;
    orgIdCode?: string | null;
  } | null>(null);

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData?.user || null);

        if (meData?.user?.organizationId) {
          const [postsRes, historyRes] = await Promise.all([
            fetch('/api/posts'),
            fetch('/api/submissions?myHistory=true'),
          ]);

          const postsData = await postsRes.json();
          const historyData = await historyRes.json();

          if (Array.isArray(postsData)) setPosts(postsData);
          if (Array.isArray(historyData)) setHistory(historyData);
        } else {
          // Pull user personal submission history if available
          const historyRes = await fetch('/api/submissions?myHistory=true');
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            if (Array.isArray(historyData)) setHistory(historyData);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load member dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  const hasOrganization = Boolean(user?.organizationId);

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!hasOrganization && !loading ? (
          /* NON-ORGANIZATION USER DASHBOARD VIEW */
          <div className="space-y-8">
            {/* Friendly Welcome Card */}
            <div className="max-w-3xl mx-auto sit-card p-8 sm:p-10 bg-white border border-[#244855]/15 rounded-2xl shadow-soft text-center space-y-6">
              <div className="w-16 h-16 bg-[#FFA896]/20 border border-[#244855]/10 text-[#E64833] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Building2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
                  Welcome to {user?.organizationName || 'ClubHQ'}
                </h1>
                <p className="text-sm font-medium text-[#244855]/80 max-w-md mx-auto">
                  You are not currently part of any organization.
                </p>
              </div>

              <div className="sit-card p-6 bg-[#FFA896]/10 border border-[#244855]/10 rounded-xl text-left max-w-lg mx-auto space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#244855]">
                  Join an organization to:
                </h3>
                <ul className="space-y-2 text-xs font-medium text-[#244855]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>View published posts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Submit interactions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Access calendars</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Participate in campaigns</span>
                  </li>
                </ul>
              </div>

              <div>
                <Link
                  href="/join-organization"
                  className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-xs font-bold shadow-md rounded-xl"
                >
                  <Building2 className="w-4 h-4" /> Join Organization <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 4 Personal Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                    Joined Organization
                  </span>
                  <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[#244855] truncate">
                  Not Joined Yet
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Optional collaboration access</p>
              </div>

              <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                    Total Orgs Joined
                  </span>
                  <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                    <Building className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
                  0
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Active memberships</p>
              </div>

              <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                    Total Interacted Posts
                  </span>
                  <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
                  {history.length}
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Logged interactions</p>
              </div>

              <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                    Account Status
                  </span>
                  <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                  Active
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Verified user account</p>
              </div>
            </div>

            {/* Quick Overview & Navigation Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-4 shadow-soft">
                <h3 className="text-base font-extrabold text-[#244855] flex items-center gap-2 border-b border-[#244855]/10 pb-3">
                  <UserCheck className="w-5 h-5 text-[#E64833]" /> User Profile Overview
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-[#244855]/10">
                    <span className="text-[#244855]/70 font-bold">Account Name</span>
                    <span className="font-extrabold text-[#244855]">{user?.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#244855]/10">
                    <span className="text-[#244855]/70 font-bold">Email Address</span>
                    <span className="font-mono text-[#244855] font-semibold">{user?.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#244855]/70 font-bold">Account Role</span>
                    <span className="font-bold text-[#E64833]">{user?.role || 'USER'}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/profile"
                    className="btn-secondary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" /> Manage Account Profile & Settings
                  </Link>
                </div>
              </div>

              <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-4 shadow-soft">
                <h3 className="text-base font-extrabold text-[#244855] flex items-center gap-2 border-b border-[#244855]/10 pb-3">
                  <Building2 className="w-5 h-5 text-[#E64833]" /> Unlock Organization Features
                </h3>
                <p className="text-xs text-[#244855]/80 font-medium leading-relaxed">
                  Joining an organization unlocks campaign content calendars, published organization posts, activity tracking forms, and team analytics reports.
                </p>
                <div className="pt-2">
                  <Link
                    href="/join-organization"
                    className="btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Building2 className="w-4 h-4" /> Apply to Join an Organization <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ORGANIZATIONAL MEMBER DASHBOARD VIEW */
          <>
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#E64833] mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Member Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#244855] tracking-tight">
                Member Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#244855]/80 font-medium">
                Browse published organization posts and track your logged interaction proof.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  {posts.length}
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Published organization posts</p>
              </div>

              <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                    Total Interacted Posts
                  </span>
                  <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
                  {history.length}
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Posts you have interacted with</p>
              </div>

              <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#244855]/70 uppercase tracking-wider">
                    Participation Status
                  </span>
                  <div className="p-2 rounded-xl bg-[#FFA896]/20 text-[#E64833]">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#E64833]">
                  {history.length > 0 ? 'ACTIVE' : 'READY'}
                </div>
                <p className="text-[11px] text-[#244855]/70 font-medium">Organization Member Verified</p>
              </div>
            </div>

            {/* Published Posts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-[#244855]">Latest Organization Posts</h2>
                <Link href="/member/posts" className="text-xs font-bold text-[#E64833] hover:underline flex items-center gap-1">
                  View All Posts <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="sit-card p-12 text-center text-xs font-semibold text-[#244855]">
                  Loading organization posts...
                </div>
              ) : posts.length === 0 ? (
                <div className="sit-card p-12 text-center text-xs font-semibold text-[#244855]">
                  No campaign posts available yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(0, 6).map((post) => (
                    <div
                      key={post.id}
                      className="sit-card p-5 bg-white border border-[#244855]/15 rounded-2xl space-y-4 shadow-soft flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FFA896]/20 text-[#244855] border border-[#244855]/10">
                            ID: {post.trackingCode}
                          </span>
                          <span className="text-[10px] text-[#244855]/60 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-[#244855] line-clamp-2">
                          {post.title}
                        </h3>
                      </div>

                      <div className="pt-3 border-t border-[#244855]/10 flex items-center justify-between">
                        <Link
                          href={`/post/${post.trackingCode}`}
                          className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open & Submit Interaction
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
