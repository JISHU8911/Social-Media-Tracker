'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  Ban,
  Trash2,
  Key,
  Users,
  Award,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Org {
  id: string;
  orgId?: string | null;
  uniqueCode?: string | null;
  name: string;
  officialEmail: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  memberCount: number;
  adminCount: number;
  createdAt: string;
}

export default function PlatformSuperAdminPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/super-admin/organizations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load organizations');
      setOrgs(data.organizations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/super-admin/organizations/${id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve organization');
      setSuccess(
        `Approved ${data.organization.name}! Generated Org ID: ${data.organization.orgId}, Unique Code: ${data.organization.uniqueCode}`
      );
      fetchOrganizations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this organization registration?')) return;
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/super-admin/organizations/${id}/reject`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject organization');
      setSuccess(`Organization registration rejected.`);
      fetchOrganizations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/super-admin/organizations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setSuccess(`Status updated to ${status}`);
      fetchOrganizations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${name}? This action cannot be undone.`))
      return;
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/super-admin/organizations/${id}/status`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete organization');
      setSuccess(`Organization ${name} deleted.`);
      fetchOrganizations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrgs = orgs.filter((org) => {
    const matchesStatus = filterStatus === 'ALL' || org.status === filterStatus;
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.officialEmail.toLowerCase().includes(search.toLowerCase()) ||
      (org.orgId && org.orgId.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const pendingOrgs = orgs.filter((o) => o.status === 'PENDING');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Platform Super Admin Dashboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Global Organization Approvals, Access Management, and Multi-Tenant Control.
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrganizations}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold flex items-center gap-2 text-indigo-400"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
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

        {/* Pending Approval Section */}
        {pendingOrgs.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                Pending Organization Approvals ({pendingOrgs.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrgs.map((org) => (
                <div
                  key={org.id}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{org.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">Email: {org.officialEmail}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Registered: {new Date(org.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                      PENDING
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApprove(org.id)}
                      disabled={actionLoading === org.id}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve & Generate ID
                    </button>
                    <button
                      onClick={() => handleReject(org.id)}
                      disabled={actionLoading === org.id}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Organizations List Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-white">Organizations Directory</h2>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, ORG-ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Organization</th>
                    <th className="p-4">Org ID / Code</th>
                    <th className="p-4">Official Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Members</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Loading organizations...
                      </td>
                    </tr>
                  ) : filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No organizations found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-semibold text-white">{org.name}</td>
                        <td className="p-4 font-mono">
                          {org.orgId ? (
                            <div className="space-y-1">
                              <span className="block text-indigo-400 font-bold">{org.orgId}</span>
                              <span className="block text-[10px] text-slate-500">
                                Code: {org.uniqueCode}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Not generated</span>
                          )}
                        </td>
                        <td className="p-4">{org.officialEmail}</td>
                        <td className="p-4">
                          <StatusBadge status={org.status} />
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-white">{org.memberCount}</span> members (
                          {org.adminCount} admins)
                        </td>
                        <td className="p-4 text-slate-400">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {org.status === 'PENDING' ? (
                            <button
                              onClick={() => handleApprove(org.id)}
                              disabled={actionLoading === org.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all text-xs font-medium"
                            >
                              Approve
                            </button>
                          ) : org.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(org.id, 'SUSPENDED')}
                              disabled={actionLoading === org.id}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-white transition-all text-xs font-medium"
                            >
                              Suspend
                            </button>
                          ) : org.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => handleStatusChange(org.id, 'ACTIVE')}
                              disabled={actionLoading === org.id}
                              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-xs font-medium"
                            >
                              Activate
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleDelete(org.id, org.name)}
                            disabled={actionLoading === org.id}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                            title="Delete Organization"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider">
        ACTIVE
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold tracking-wider">
        PENDING
      </span>
    );
  }
  if (status === 'SUSPENDED') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold tracking-wider">
        SUSPENDED
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold tracking-wider">
      REJECTED
    </span>
  );
}
