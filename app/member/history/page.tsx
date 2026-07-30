'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Activity, Clock, Edit2, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';

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
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-400" /> My Activity History
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              View and edit your previously submitted social media interactions.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh History
          </button>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Post Title</th>
                  <th className="p-4">Recorded Actions</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Loading activity history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
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
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <div className="space-y-0.5">
                            <span className="block">{item.post?.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Code: {item.post?.trackingCode}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            {fb.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-semibold">
                                FB: {fb.join(', ')}
                              </span>
                            )}
                            {ig.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/30 text-[10px] font-semibold">
                                IG: {ig.join(', ')}
                              </span>
                            )}
                            {li.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-semibold">
                                LI: {li.join(', ')}
                              </span>
                            )}
                            {x.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-semibold">
                                X: {x.join(', ')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(item.updatedAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/post/${item.post?.trackingCode}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-medium inline-flex items-center gap-1"
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
