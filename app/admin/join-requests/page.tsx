'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { UserCheck, Check, X, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface JoinReq {
  id: string;
  user: { id: string; name: string; email: string };
  designation: { id: string; designationName: string };
  status: string;
  createdAt: string;
}

export default function JoinRequestsPage() {
  const [requests, setRequests] = useState<JoinReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/join-requests');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load join requests');
      setRequests(data.joinRequests || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/join-requests/${id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve request');
      setSuccess(`Approved ${name} as Organization Member.`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/join-requests/${id}/reject`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject request');
      setSuccess(`Rejected join request for ${name}.`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-400" /> Organization Join Requests
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review and approve pending employee requests to join your organization workspace.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Pending Requests ({pendingRequests.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Applicant Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Selected Designation</th>
                  <th className="p-4">Request Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Loading join requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No join requests found for your organization.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white">{req.user.name}</td>
                      <td className="p-4">{req.user.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-[11px]">
                          {req.designation?.designationName || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {req.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApprove(req.id, req.user.name)}
                              disabled={actionLoading === req.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id, req.user.name)}
                              disabled={actionLoading === req.id}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs inline-flex items-center gap-1 transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
