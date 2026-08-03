'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Send,
  Clock,
  LayoutDashboard,
  Plus,
  AlertTriangle,
  ArrowRight,
  Hourglass,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface DesignationItem {
  id: string;
  designationName: string;
}

interface PendingRequestItem {
  id: string;
  organizationId: string;
  organizationName: string;
  orgIdCode: string;
  designationName: string;
  status: string;
  createdAt: string;
}

export default function JoinOrganizationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pendingRequests, setPendingRequests] = useState<PendingRequestItem[]>([]);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const [orgIdInput, setOrgIdInput] = useState('');
  const [uniqueCodeInput, setUniqueCodeInput] = useState('');
  const [verifyingOrg, setVerifyingOrg] = useState(false);
  const [alreadySentAlert, setAlreadySentAlert] = useState<string | null>(null);

  const [verifiedOrg, setVerifiedOrg] = useState<{
    organizationId: string;
    organizationName: string;
    orgIdCode: string;
    designations: DesignationItem[];
    alreadySent?: boolean;
  } | null>(null);

  const [selectedDesignationId, setSelectedDesignationId] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  const fetchSessionAndRequests = async () => {
    setLoading(true);
    try {
      const [sessionRes, requestsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/organizations/my-requests'),
      ]);

      const sessionData = await sessionRes.json();
      if (sessionRes.ok && sessionData.user) {
        setUser(sessionData.user);
      } else {
        router.push('/login');
        return;
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        if (Array.isArray(requestsData)) {
          setPendingRequests(requestsData);
          if (requestsData.length === 0) {
            setShowJoinForm(true);
          }
        }
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndRequests();
  }, []);

  const handleVerifyOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setAlreadySentAlert(null);
    setVerifiedOrg(null);
    setSelectedDesignationId('');

    if (!orgIdInput.trim() || !uniqueCodeInput.trim()) {
      setError('Both Organization ID and Unique Code are required');
      return;
    }

    setVerifyingOrg(true);

    try {
      const res = await fetch('/api/organizations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: orgIdInput,
          uniqueCode: uniqueCodeInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid Organization credentials');
      }

      if (data.alreadySent) {
        setAlreadySentAlert(data.message || `Joining Request Already sent to ${data.organizationName}`);
      }

      setVerifiedOrg({
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        orgIdCode: data.orgIdCode,
        designations: data.designations || [],
        alreadySent: data.alreadySent,
      });

      if (!data.alreadySent) {
        setSuccess(`Organization found: ${data.organizationName}. Please select your designation.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify organization');
    } finally {
      setVerifyingOrg(false);
    }
  };

  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!verifiedOrg) {
      setError('Please verify organization first');
      return;
    }

    if (verifiedOrg.alreadySent) {
      setError(`Joining Request Already sent to ${verifiedOrg.organizationName}`);
      return;
    }

    if (!selectedDesignationId) {
      setError('Designation selection is mandatory');
      return;
    }

    setSubmittingJoin(true);

    try {
      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: orgIdInput,
          uniqueCode: uniqueCodeInput,
          designationId: selectedDesignationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit join request');
      }

      setSuccess(`Joining Request Sent to ${verifiedOrg.organizationName}! Status: PENDING approval.`);
      setVerifiedOrg(null);
      setOrgIdInput('');
      setUniqueCodeInput('');
      setSelectedDesignationId('');
      fetchSessionAndRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmittingJoin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#124E66] mx-auto" />
          <p className="text-xs font-bold text-[#2E3944]">Loading Join Organization workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner / Header */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D3D9D4] border border-[#748D92] flex items-center justify-center text-[#124E66] font-extrabold text-xl">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#212A31]">Join an Organization</h1>
              <p className="text-xs text-[#2E3944] font-medium">
                Enter your Organization ID and Unique Code to apply for organization member access.
              </p>
            </div>
          </div>
          <Link
            href="/member"
            className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-center"
          >
            <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#212A31] flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-[#124E66]" /> Active Join Requests ({pendingRequests.length})
              </h2>
            </div>

            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="sit-card p-6 bg-white border border-[#124E66]/60 rounded-2xl space-y-4 shadow-soft"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#748D92]/30 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#124E66] block mb-1">
                      Request Status
                    </span>
                    <h3 className="text-lg font-extrabold text-[#212A31]">
                      Joining Request Sent to {req.organizationName}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shrink-0 self-start sm:self-center">
                    <Clock className="w-3.5 h-3.5" /> PENDING APPROVAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-[#D3D9D4]/40 border border-[#748D92]/40">
                    <span className="text-[#2E3944] block text-[10px] uppercase font-bold">
                      Organization
                    </span>
                    <span className="font-extrabold text-[#212A31] text-sm mt-0.5 block">
                      {req.organizationName}
                    </span>
                    <span className="font-mono text-[#124E66] text-[11px]">
                      {req.orgIdCode || 'ID Pending'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#D3D9D4]/40 border border-[#748D92]/40">
                    <span className="text-[#2E3944] block text-[10px] uppercase font-bold">
                      Requested Designation
                    </span>
                    <span className="font-extrabold text-[#212A31] text-sm mt-0.5 block">
                      {req.designationName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#D3D9D4]/40 border border-[#748D92]/40">
                    <span className="text-[#2E3944] block text-[10px] uppercase font-bold">
                      Submitted Date
                    </span>
                    <span className="font-medium text-[#212A31] text-sm mt-0.5 block font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#2E3944] font-medium leading-relaxed pt-1">
                  Your request has been submitted to the Organization Administrator of{' '}
                  <strong className="text-[#212A31]">{req.organizationName}</strong>. You will gain full member access as soon as your request is approved.
                </p>
              </div>
            ))}

            {!showJoinForm && (
              <div className="sit-card p-4 bg-white border border-[#748D92] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#2E3944] font-medium">
                  Need to apply to a different organization?
                </span>
                <button
                  type="button"
                  onClick={() => setShowJoinForm(true)}
                  className="btn-primary px-5 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Join Another Organization
                </button>
              </div>
            )}
          </section>
        )}

        {/* Join Organization Form Card */}
        {showJoinForm && (
          <section className="sit-card p-6 sm:p-8 bg-white border border-[#748D92] rounded-2xl space-y-6 shadow-soft">
            <div className="flex items-center justify-between border-b border-[#748D92]/30 pb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#124E66]" />
                <div>
                  <h2 className="text-lg font-extrabold text-[#212A31]">Join an Organization</h2>
                  <p className="text-xs text-[#2E3944] font-medium">
                    Enter Organization ID and Unique Code to submit a join request.
                  </p>
                </div>
              </div>
              {pendingRequests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="text-xs text-[#124E66] hover:underline font-semibold"
                >
                  Hide Form
                </button>
              )}
            </div>

            {alreadySentAlert && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block font-bold">{alreadySentAlert}</strong>
                  <span>
                    A join request for this organization has already been submitted and is currently pending admin approval.
                  </span>
                </div>
              </div>
            )}

            {!verifiedOrg ? (
              <form onSubmit={handleVerifyOrg} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                      Organization ID * (e.g. ORG-1001)
                    </label>
                    <input
                      type="text"
                      required
                      value={orgIdInput}
                      onChange={(e) => setOrgIdInput(e.target.value.toUpperCase())}
                      placeholder="ORG-1001"
                      className="w-full px-4 py-3 rounded-xl sit-input font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                      Organization Unique Code * (e.g. K8P2X9F4)
                    </label>
                    <input
                      type="text"
                      required
                      value={uniqueCodeInput}
                      onChange={(e) => setUniqueCodeInput(e.target.value.toUpperCase())}
                      placeholder="K8P2X9F4"
                      className="w-full px-4 py-3 rounded-xl sit-input font-mono text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyingOrg}
                  className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {verifyingOrg ? 'Verifying Credentials...' : 'Verify Organization'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitJoin} className="space-y-5">
                <div className="p-4 rounded-xl bg-[#D3D9D4]/50 border border-[#748D92] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#2E3944] font-bold block">Target Organization</span>
                    <h3 className="text-base font-extrabold text-[#212A31]">{verifiedOrg.organizationName}</h3>
                    <span className="text-xs text-[#124E66] font-mono font-bold">ID: {verifiedOrg.orgIdCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedOrg(null);
                      setAlreadySentAlert(null);
                    }}
                    className="text-xs font-bold text-[#124E66] hover:underline"
                  >
                    Change Org
                  </button>
                </div>

                {verifiedOrg.alreadySent ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <strong className="block font-bold">
                        Joining Request Already sent to {verifiedOrg.organizationName}
                      </strong>
                      <span>
                        You have already submitted a join request to this organization. Please wait for the organization admin to review and approve your request.
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                        Select Designation * (Mandatory)
                      </label>
                      <select
                        required
                        value={selectedDesignationId}
                        onChange={(e) => setSelectedDesignationId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl sit-input text-xs font-medium"
                      >
                        <option value="">-- Choose Designation --</option>
                        {verifiedOrg.designations.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.designationName}
                          </option>
                        ))}
                      </select>
                      {verifiedOrg.designations.length === 0 && (
                        <p className="text-xs text-amber-800 font-medium mt-2">
                          No active designations found for this organization. Please ask your Org Admin to create designations first.
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={submittingJoin || !selectedDesignationId}
                      className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {submittingJoin ? 'Submitting Join Request...' : 'Submit Join Request'}{' '}
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
