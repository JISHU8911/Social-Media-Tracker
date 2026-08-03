'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Clock,
  LayoutDashboard,
  Plus,
  Hourglass,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Mail,
  Lock,
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

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pending Join Requests state
  const [pendingRequests, setPendingRequests] = useState<PendingRequestItem[]>([]);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Join form state
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
          <p className="text-xs font-bold text-[#2E3944]">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Info Header */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D3D9D4] border border-[#748D92] flex items-center justify-center text-[#212A31] font-extrabold text-2xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#212A31]">{user?.name}</h1>
              <p className="text-xs text-[#2E3944] font-medium">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#212A31] text-white text-[10px] font-bold uppercase tracking-wider">
                  Role: {user?.role}
                </span>
                {user?.organizationName ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                    Org: {user?.organizationName} ({user?.orgIdCode})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D3D9D4] border border-[#748D92] text-[#2E3944] text-[10px] font-extrabold uppercase tracking-wider">
                    No Organization Joined
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link
            href="/member"
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-center shadow-sm"
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

        {/* Account Details & Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <h2 className="text-base font-extrabold text-[#212A31] flex items-center gap-2 border-b border-[#748D92]/30 pb-3">
              <UserCheck className="w-5 h-5 text-[#124E66]" /> Account Summary
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#748D92]/20">
                <span className="text-[#2E3944] font-bold">Full Name</span>
                <span className="font-extrabold text-[#212A31]">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#748D92]/20">
                <span className="text-[#2E3944] font-bold">Email Address</span>
                <span className="font-mono text-[#212A31] font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#748D92]/20">
                <span className="text-[#2E3944] font-bold">Account Role</span>
                <span className="font-bold text-[#124E66]">{user?.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#748D92]/20">
                <span className="text-[#2E3944] font-bold">Joined Organization</span>
                <span className="font-bold text-[#212A31]">
                  {user?.organizationName || 'Not Joined Yet'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#2E3944] font-bold">Account Status</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-4 shadow-soft">
            <h2 className="text-base font-extrabold text-[#212A31] flex items-center gap-2 border-b border-[#748D92]/30 pb-3">
              <Building2 className="w-5 h-5 text-[#124E66]" /> Organization Status
            </h2>
            {user?.organizationName ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Active Membership
                </span>
                <p className="text-sm font-extrabold text-[#212A31]">{user.organizationName}</p>
                <p className="text-xs text-[#2E3944] font-mono">Org ID: {user.orgIdCode}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#2E3944] font-medium leading-relaxed">
                  You are currently using ClubHQ as an independent user. You can apply to join an organization anytime to unlock collaborative campaigns and content features.
                </p>
                <Link
                  href="/join-organization"
                  className="btn-primary w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  <Building2 className="w-4 h-4" /> Go to Join Organization Page
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pending Join Requests Status Cards */}
        {pendingRequests.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#212A31] flex items-center gap-2">
                <Hourglass className="w-5 h-5 text-[#124E66]" /> Active Join Requests ({pendingRequests.length})
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
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
