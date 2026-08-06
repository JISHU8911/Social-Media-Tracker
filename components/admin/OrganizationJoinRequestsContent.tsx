'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { UserCheck, Check, X, RefreshCw, AlertCircle, CheckCircle, Building2, Copy, CheckCheck } from 'lucide-react';

interface JoinRequest {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  designation: {
    designationName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface OrgInfo {
  id: string;
  name: string;
  orgId?: string | null;
  uniqueCode?: string | null;
}

export function OrganizationJoinRequestsContent({ hideNavbar = false }: { hideNavbar?: boolean }) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [organization, setOrganization] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<'orgId' | 'uniqueCode' | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, sessionRes] = await Promise.all([
        fetch('/api/admin/join-requests'),
        fetch('/api/auth/me'),
      ]);

      const reqData = await reqRes.json();
      const sessionData = await sessionRes.json();

      if (reqRes.ok && reqData) {
        // Parse requests array safely
        if (Array.isArray(reqData.requests)) {
          setRequests(reqData.requests);
        } else if (Array.isArray(reqData.joinRequests)) {
          setRequests(reqData.joinRequests);
        } else if (Array.isArray(reqData)) {
          setRequests(reqData);
        }

        // Parse organization info safely
        if (reqData.organization) {
          setOrganization(reqData.organization);
        } else if (sessionData?.user?.organizationId) {
          setOrganization({
            id: sessionData.user.organizationId,
            name: sessionData.user.organizationName || 'Organization',
            orgId: sessionData.user.orgIdCode,
            uniqueCode: sessionData.user.uniqueCode,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCopy = (text: string, field: 'orgId' | 'uniqueCode') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApprove = async (requestId: string, userName: string) => {
    setActionLoading(requestId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/join-requests/${requestId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve request');
      setSuccess(`Approved ${userName}'s join request.`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string, userName: string) => {
    setActionLoading(requestId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/join-requests/${requestId}/reject`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject request');
      setSuccess(`Rejected ${userName}'s join request.`);
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  const displayOrgId = organization?.orgId || (organization?.id ? `ORG-${organization.id.slice(0, 4).toUpperCase()}` : 'ORG-1001');
  const displayUniqueCode = organization?.uniqueCode || 'UNAVAILABLE';

  return (
    <div className={hideNavbar ? 'space-y-8 font-sans' : 'min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans'}>
      {!hideNavbar && <Navbar />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#212A31] flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-[#124E66]" /> Organization Join Requests
            </h1>
            <p className="text-xs text-[#2E3944] font-medium mt-1">
              Review and approve pending member requests to join your organization workspace.
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* ORGANIZATION INFORMATION SECTION */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl shadow-soft space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#748D92]/30 pb-3">
            <Building2 className="w-5 h-5 text-[#124E66]" />
            <h2 className="text-base font-extrabold text-[#212A31]">Organization Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#D3D9D4]/40 border border-[#748D92]/40 space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#2E3944] block">
                Organization Name
              </span>
              <span className="text-base font-extrabold text-[#212A31] block">
                {organization?.name || 'Your Organization'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#D3D9D4]/40 border border-[#748D92]/40 space-y-1 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#2E3944] block">
                  Organization ID
                </span>
                <span className="text-base font-extrabold font-mono text-[#212A31] block">
                  {displayOrgId}
                </span>
              </div>
              <button
                onClick={() => handleCopy(displayOrgId, 'orgId')}
                className="px-3 py-1.5 rounded-lg bg-[#212A31] text-white hover:bg-[#124E66] text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                title="Copy Organization ID"
              >
                {copiedField === 'orgId' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#D3D9D4]/40 border border-[#748D92]/40 space-y-1 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#2E3944] block">
                  Organization Unique Code
                </span>
                <span className="text-base font-extrabold font-mono text-[#124E66] block tracking-wider">
                  {displayUniqueCode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(displayUniqueCode, 'uniqueCode')}
                className="px-3 py-1.5 rounded-lg bg-[#124E66] text-white hover:bg-[#0E3E52] text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                title="Copy Unique Code"
              >
                {copiedField === 'uniqueCode' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
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

        {/* Pending Requests Cards */}
        {pendingRequests.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-[#212A31] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#124E66] animate-pulse"></span>
              Pending Requests ({pendingRequests.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="sit-card p-6 bg-white border border-[#124E66]/60 rounded-2xl space-y-4 shadow-soft"
                >
                  <div>
                    <h3 className="text-base font-extrabold text-[#212A31]">{req.user?.name || 'User'}</h3>
                    <p className="text-xs text-[#2E3944] font-medium">{req.user?.email}</p>
                    <div className="mt-2 text-xs text-[#212A31] font-bold">
                      Requested Designation: <span className="text-[#124E66]">{req.designation?.designationName || 'Member'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-[#748D92]/30">
                    <button
                      onClick={() => handleApprove(req.id, req.user?.name || 'User')}
                      disabled={actionLoading === req.id}
                      className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id, req.user?.name || 'User')}
                      disabled={actionLoading === req.id}
                      className="btn-danger flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Requests Table */}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#212A31]">Request History</h2>

          <div className="sit-card bg-white border border-[#748D92] rounded-2xl overflow-hidden shadow-soft">
            {loading ? (
              <div className="p-12 text-center text-xs font-semibold text-[#2E3944]">
                Loading join request logs...
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#2E3944] font-medium">
                No join requests recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#212A31]">
                  <thead className="sit-table-header text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Request Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#748D92]/30 font-medium">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-[#D3D9D4]/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-sm text-[#212A31]">{r.user?.name || 'User'}</p>
                          <p className="text-[#2E3944] font-medium">{r.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#212A31]">{r.designation?.designationName || 'Member'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              r.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'PENDING'
                                ? 'bg-[#D3D9D4] text-[#124E66] border border-[#124E66]'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[#748D92]">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
