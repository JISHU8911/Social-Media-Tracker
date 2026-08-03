'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Activity, Clock, CheckCircle2, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

interface SubmissionItem {
  id: string;
  fullName: string;
  post: {
    id: string;
    title: string;
    trackingCode: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: string;
    createdAt: string;
  };
  designation: { designationName: string };
  facebookActions?: string | null;
  instagramActions?: string | null;
  linkedinActions?: string | null;
  xActions?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MyInteractionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (!data.user.organizationId && data.user.role !== 'PLATFORM_SUPER_ADMIN' && data.user.role !== 'SUPER_ADMIN') {
            alert('Join an organization to access organization resources.');
            router.push('/join-organization');
          } else {
            fetchInteractions();
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions?myHistory=true');
      const data = await res.json();
      if (Array.isArray(data)) setSubmissions(data);
    } catch (err) {
      console.error('Failed to load member interactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseActions = (jsonStr?: string | null) => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#124E66] mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Personal Proof Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
              My Logged Interactions
            </h1>
            <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
              Comprehensive log of all social interaction proof submitted by your member account.
            </p>
          </div>

          <button
            onClick={fetchInteractions}
            className="btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="sit-card p-12 text-center text-xs font-semibold text-[#2E3944]">
            Loading your logged interactions...
          </div>
        ) : submissions.length === 0 ? (
          <div className="sit-card p-12 text-center space-y-3">
            <Activity className="h-10 w-10 text-[#748D92] mx-auto" />
            <h3 className="text-sm font-bold text-[#212A31]">No Interactions Logged Yet</h3>
            <p className="text-xs text-[#2E3944]">Browse published posts to complete and submit proof for social campaigns.</p>
            <Link href="/member/posts" className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs">
              Browse Published Posts
            </Link>
          </div>
        ) : (
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#212A31]">Submitted Action History</h2>
              <span className="text-xs font-bold text-[#124E66]">{submissions.length} Logged Entries</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#748D92]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#212A31] text-white font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Tracking Code</th>
                    <th className="px-4 py-3">Campaign Title</th>
                    <th className="px-4 py-3">My Designation</th>
                    <th className="px-4 py-3">Logged Platforms</th>
                    <th className="px-4 py-3">Logged Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#748D92]/30 font-medium">
                  {submissions.map((sub) => {
                    const fb = parseActions(sub.facebookActions);
                    const ig = parseActions(sub.instagramActions);
                    const li = parseActions(sub.linkedinActions);
                    const tw = parseActions(sub.xActions);

                    return (
                      <tr key={sub.id} className="hover:bg-[#D3D9D4]/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#124E66]">
                          {sub.post?.trackingCode || 'N/A'}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#212A31]">
                          {sub.post?.title || 'Campaign Post'}
                        </td>
                        <td className="px-4 py-3 text-[#2E3944] font-semibold">
                          {sub.designation?.designationName || 'Member'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {fb.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] border border-[#748D92]">
                                FB ({fb.length})
                              </span>
                            )}
                            {ig.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] border border-[#748D92]">
                                IG ({ig.length})
                              </span>
                            )}
                            {li.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] border border-[#748D92]">
                                LI ({li.length})
                              </span>
                            )}
                            {tw.length > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] border border-[#748D92]">
                                X ({tw.length})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#748D92] font-mono">
                          {new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/post/${sub.post?.trackingCode}`}
                            className="btn-primary px-3 py-1 text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                          >
                            Update Proof <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
