'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Activity, Clock, Edit2, CheckCircle2, RefreshCw } from 'lucide-react';

interface HistoryItem {
  id: string;
  fullName: string;
  post: { title: string; trackingCode: string; imageUrl?: string };
  designation: { designationName: string };
  facebookActions?: string | null;
  instagramActions?: string | null;
  linkedinActions?: string | null;
  xActions?: string | null;
  updatedAt: string;
}

export default function MyActivityHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions?myHistory=true');
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) {
      console.error('Failed to load activity history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#212A31] flex items-center gap-2">
              <Activity className="w-6 h-6 text-[#124E66]" /> My Activity History
            </h1>
            <p className="text-xs text-[#2E3944] font-medium mt-1">
              View and edit your previously submitted social media interactions.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh History
          </button>
        </div>

        <div className="sit-card bg-white border border-[#748D92] rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#212A31]">
              <thead className="sit-table-header text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Post Title</th>
                  <th className="p-4">Recorded Actions</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#748D92]/30 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-semibold text-[#2E3944]">
                      Loading activity history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-medium text-[#2E3944]">
                      No interaction submissions recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => {
                    const fb = parseActions(item.facebookActions);
                    const ig = parseActions(item.instagramActions);
                    const li = parseActions(item.linkedinActions);
                    const x = parseActions(item.xActions);

                    return (
                      <tr key={item.id} className="hover:bg-[#D3D9D4]/40 transition-colors">
                        <td className="p-4">
                          <p className="font-extrabold text-sm text-[#212A31] line-clamp-1">
                            {item.post.title}
                          </p>
                          <span className="text-[10px] font-mono text-[#748D92]">
                            Code: {item.post.trackingCode}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {fb.map((a: string, i: number) => (
                              <span key={`fb-${i}`} className="px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] text-[10px] font-bold border border-[#748D92]">
                                FB: {a}
                              </span>
                            ))}
                            {ig.map((a: string, i: number) => (
                              <span key={`ig-${i}`} className="px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] text-[10px] font-bold border border-[#748D92]">
                                IG: {a}
                              </span>
                            ))}
                            {li.map((a: string, i: number) => (
                              <span key={`li-${i}`} className="px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] text-[10px] font-bold border border-[#748D92]">
                                LI: {a}
                              </span>
                            ))}
                            {x.map((a: string, i: number) => (
                              <span key={`x-${i}`} className="px-2 py-0.5 rounded bg-[#D3D9D4] text-[#212A31] text-[10px] font-bold border border-[#748D92]">
                                X: {a}
                              </span>
                            ))}
                            {fb.length === 0 && ig.length === 0 && li.length === 0 && x.length === 0 && (
                              <span className="text-[10px] text-[#748D92]">None</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[#748D92]">
                          {new Date(item.updatedAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/post/${item.post.trackingCode}`}
                            className="btn-primary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Submission
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
