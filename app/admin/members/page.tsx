'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Users, Shield, UserCheck, Power, RefreshCw, AlertCircle, CheckCircle, Search } from 'lucide-react';

interface MemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  designation: string;
  role: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  joinedAt: string;
}

export default function MembersListPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/members');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load organization members');
      setMembers(data.members || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAction = async (id: string, action: 'PROMOTE' | 'DEMOTE' | 'TOGGLE_ACTIVE', name: string) => {
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to perform action');
      setSuccess(`Updated status/role for ${name}`);
      fetchMembers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-400" /> Organization Members Roster
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted strictly to active members and administrators of your organization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member name, email..."
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={fetchMembers}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-400 hover:bg-slate-800 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Loading members...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No members found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white">{m.name}</td>
                      <td className="p-4">{m.email}</td>
                      <td className="p-4 font-medium text-indigo-400">{m.designation}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold tracking-wider">
                          {m.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {m.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                            DEACTIVATED
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {m.role === 'MEMBER' && (
                          <button
                            onClick={() => handleAction(m.id, 'PROMOTE', m.name)}
                            disabled={actionLoading === m.id}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-xs font-medium disabled:opacity-50"
                          >
                            Promote to Admin
                          </button>
                        )}
                        {m.role === 'ORGANIZATION_ADMIN' && (
                          <button
                            onClick={() => handleAction(m.id, 'DEMOTE', m.name)}
                            disabled={actionLoading === m.id}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-white transition-all text-xs font-medium disabled:opacity-50"
                          >
                            Demote Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(m.id, 'TOGGLE_ACTIVE', m.name)}
                          disabled={actionLoading === m.id}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all text-xs font-medium disabled:opacity-50"
                        >
                          {m.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
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
