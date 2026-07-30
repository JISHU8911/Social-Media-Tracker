'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Share2,
  FileText,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  CheckCircle2,
  Edit,
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

  const fetchMemberData = async () => {
    setLoading(true);
    try {
      const [postsRes, historyRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/submissions?myHistory=true'),
      ]);

      const postsData = await postsRes.json();
      const historyData = await historyRes.json();

      if (Array.isArray(postsData)) setPosts(postsData);
      if (Array.isArray(historyData)) setHistory(historyData);
    } catch (err) {
      console.error('Failed to load member data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  // Compute interaction breakdown statistics
  let totalInteractions = 0;
  let fbCount = 0;
  let igCount = 0;
  let liCount = 0;
  let xCount = 0;

  history.forEach((sub) => {
    try {
      const fb = sub.facebookActions ? JSON.parse(sub.facebookActions) : [];
      const ig = sub.instagramActions ? JSON.parse(sub.instagramActions) : [];
      const li = sub.linkedinActions ? JSON.parse(sub.linkedinActions) : [];
      const x = sub.xActions ? JSON.parse(sub.xActions) : [];

      fbCount += fb.length;
      igCount += ig.length;
      liCount += li.length;
      xCount += x.length;
      totalInteractions += fb.length + ig.length + li.length + x.length;
    } catch (e) {}
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Member Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Organization Member Hub
            </div>
            <h1 className="text-2xl font-bold text-white">Member Engagement Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Participate in active social posts and track your engagement statistics.
            </p>
          </div>
          <Link
            href="/member/history"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
          >
            My Activity History <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Statistics Cards (Section 15) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Interactions
            </span>
            <span className="text-2xl font-bold text-white">{totalInteractions}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 space-y-1">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
              Facebook
            </span>
            <span className="text-2xl font-bold text-white">{fbCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-pink-500/20 space-y-1">
            <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-wider block">
              Instagram
            </span>
            <span className="text-2xl font-bold text-white">{igCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/20 space-y-1">
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block">
              LinkedIn
            </span>
            <span className="text-2xl font-bold text-white">{liCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              X (Twitter)
            </span>
            <span className="text-2xl font-bold text-white">{xCount}</span>
          </div>
        </div>

        {/* Active Organization Posts Grid (Section 14 & 15) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Active Organization Posts
          </h2>

          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Loading organization posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              No active posts found for your organization.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3 p-4">
                    {post.imageUrl && (
                      <div className="h-44 rounded-xl overflow-hidden bg-slate-950">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-base font-bold text-white line-clamp-2">{post.title}</h3>
                    {post.caption && (
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
                    <Link
                      href={`/post/${post.trackingCode}`}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
                    >
                      Submit Interaction <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
