'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Users, Search, RefreshCw, AlertCircle, CheckCircle, Shield, UserMinus, Lock } from 'lucide-react';

interface MemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function OrganizationMembersPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('MEMBER');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchMembersAndSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionRes, membersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/members'),
      ]);

      const sessionData = await sessionRes.json();
      if (sessionRes.ok && sessionData.user) {
        setCurrentUserRole(sessionData.user.role);
      }

      const membersData = await membersRes.json();
      if (!membersRes.ok) throw new Error(membersData.error || 'Failed to load organization members');
      if (Array.isArray(membersData.members)) setMembers(membersData.members);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndSession();
  }, []);

  const isOrgSuperAdminUser =
    currentUserRole === 'ORGANIZATION_SUPER_ADMIN' ||
    currentUserRole === 'PLATFORM_SUPER_ADMIN' ||
    currentUserRole === 'SUPER_ADMIN';

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!isOrgSuperAdminUser) {
      setError('Only Organization Super Admin can change member roles.');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update member role');
      setSuccess('Member role updated successfully.');
      fetchMembersAndSession();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!isOrgSuperAdminUser) {
      setError('Only Organization Super Admin can remove members.');
      return;
    }
    if (!confirm(`Are you sure you want to remove ${name} from your organization?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');
      setSuccess(`Member ${name} removed.`);
      fetchMembersAndSession();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.designation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#212A31] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#124E66]" /> Organization Members Roster
            </h1>
            <p className="text-xs text-[#2E3944] font-medium mt-1">
              Restricted strictly to active members and administrators of your organization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#748D92]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member name, email..."
                className="pl-9 pr-4 py-2 rounded-xl sit-input text-xs font-medium"
              />
            </div>
            <button
              onClick={fetchMembersAndSession}
              className="btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
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

        <div className="sit-card bg-white border border-[#748D92] rounded-2xl overflow-hidden shadow-soft">
          {loading ? (
            <div className="p-12 text-center text-xs font-semibold text-[#2E3944]">
              Loading organization members roster...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#2E3944] font-medium">
              No organization members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#212A31]">
                <thead className="sit-table-header text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Member Name</th>
                    <th className="px-6 py-4">Designation</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#748D92]/30 font-medium">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-[#D3D9D4]/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-sm text-[#212A31]">{m.name}</p>
                        <p className="text-[#2E3944] font-medium">{m.email}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#212A31]">{m.designation || 'Staff'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                            m.role.includes('ADMIN')
                              ? 'bg-[#212A31] text-white'
                              : 'bg-[#D3D9D4] text-[#212A31] border border-[#748D92]'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[#748D92]">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {m.role === 'ORGANIZATION_SUPER_ADMIN' ? (
                          <span className="text-xs font-semibold text-[#124E66] bg-[#D3D9D4] px-3 py-1.5 rounded-lg border border-[#748D92] inline-block">
                            Primary Organization Super Admin
                          </span>
                        ) : !isOrgSuperAdminUser ? (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> View Only (Super Admin Required)
                          </span>
                        ) : (
                          <>
                            {m.role === 'MEMBER' ? (
                              <button
                                onClick={() => handleRoleChange(m.id, 'ORGANIZATION_ADMIN')}
                                className="px-3 py-1.5 rounded-lg bg-[#124E66] text-white text-xs font-bold hover:bg-[#0E3E52] transition-colors shadow-sm inline-flex items-center gap-1"
                              >
                                <Shield className="w-3.5 h-3.5" /> Make Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRoleChange(m.id, 'MEMBER')}
                                className="px-3 py-1.5 rounded-lg bg-[#2E3944] text-white text-xs font-bold hover:bg-[#242D36] transition-colors shadow-sm inline-flex items-center gap-1"
                              >
                                Demote to Member
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(m.id, m.name)}
                              className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-bold hover:bg-red-800 transition-colors shadow-sm inline-flex items-center gap-1"
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Remove
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
