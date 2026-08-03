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
  Users,
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
      setSuccess(`Organization ${data.organization.name} APPROVED successfully.`);
      fetchOrganizations();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/super-admin/organizations/${id}/reject`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject organization');
      setSuccess('Organization REJECTED successfully.');
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
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#124E66] flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#212A31]">Platform Super Admin Dashboard</h1>
              <p className="text-xs text-[#2E3944] font-medium mt-0.5">
                Global Organization Approvals, Access Management, and Multi-Tenant Governance.
              </p>
            </div>
          </div>
          <button
            onClick={fetchOrganizations}
            className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-3 font-medium">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider">
                Total Organizations
              </span>
              <div className="p-2 rounded-lg bg-[#D3D9D4] text-[#212A31]">
                <Building2 className="h-5 w-5 text-[#212A31]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {orgs.length}
            </div>
            <p className="text-[11px] text-[#2E3944] font-medium">Registered tenants</p>
          </div>

          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="p-2 rounded-lg bg-[#D3D9D4] text-[#212A31]">
                <AlertCircle className="h-5 w-5 text-[#212A31]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#124E66]">
              {pendingOrgs.length}
            </div>
            <p className="text-[11px] text-[#2E3944] font-medium">Awaiting action</p>
          </div>

          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider">
                Active Tenants
              </span>
              <div className="p-2 rounded-lg bg-[#D3D9D4] text-[#212A31]">
                <CheckCircle className="h-5 w-5 text-[#212A31]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {orgs.filter((o) => o.status === 'ACTIVE').length}
            </div>
            <p className="text-[11px] text-[#2E3944] font-medium">Live workspaces</p>
          </div>

          <div className="sit-card-stat p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E3944] uppercase tracking-wider">
                Suspended / Rejected
              </span>
              <div className="p-2 rounded-lg bg-[#D3D9D4] text-[#212A31]">
                <XCircle className="h-5 w-5 text-[#212A31]" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
              {orgs.filter((o) => o.status === 'SUSPENDED' || o.status === 'REJECTED').length}
            </div>
            <p className="text-[11px] text-[#2E3944] font-medium">Inactive workspaces</p>
          </div>
        </div>

        {/* Pending Approvals Table */}
        {pendingOrgs.length > 0 && (
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#212A31]">Pending Organization Registrations</h2>
              <span className="text-xs font-bold text-[#124E66]">{pendingOrgs.length} Pending</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#748D92]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#212A31] text-white font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Organization Name</th>
                    <th className="px-4 py-3">Official Email</th>
                    <th className="px-4 py-3">Registered Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#748D92]/30 font-medium">
                  {pendingOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-[#D3D9D4]/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#212A31]">{org.name}</td>
                      <td className="px-4 py-3 text-[#2E3944] font-mono">{org.officialEmail}</td>
                      <td className="px-4 py-3 text-[#748D92] font-mono">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(org.id)}
                          disabled={actionLoading === org.id}
                          className="btn-primary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(org.id)}
                          disabled={actionLoading === org.id}
                          className="btn-danger px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Organizations Management Table */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-extrabold text-[#212A31]">All Registered Organizations</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#748D92]" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl sit-input text-xs"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl sit-input text-xs font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#748D92]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#212A31] text-white font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tenant ID</th>
                  <th className="px-4 py-3">Organization Name</th>
                  <th className="px-4 py-3">Official Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3 text-right">Governance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#748D92]/30 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#2E3944] font-semibold">
                      Loading organizations...
                    </td>
                  </tr>
                ) : filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[#2E3944] font-semibold">
                      No matching organizations found.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-[#D3D9D4]/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#124E66]">
                        {org.orgId || org.uniqueCode || org.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#212A31]">{org.name}</td>
                      <td className="px-4 py-3 text-[#2E3944] font-mono">{org.officialEmail}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            org.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : org.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#212A31] font-bold">
                        {org.memberCount} Members ({org.adminCount} Admins)
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        {org.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(org.id)}
                            className="px-2.5 py-1 rounded bg-[#124E66] text-white text-[11px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                        {org.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'SUSPENDED')}
                            className="px-2.5 py-1 rounded bg-[#2E3944] text-white text-[11px] font-bold"
                          >
                            Suspend
                          </button>
                        )}
                        {org.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleStatusChange(org.id, 'ACTIVE')}
                            className="px-2.5 py-1 rounded bg-[#124E66] text-white text-[11px] font-bold"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(org.id, org.name)}
                          className="px-2.5 py-1 rounded bg-red-700 text-white text-[11px] font-bold hover:bg-red-800"
                        >
                          Delete
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
