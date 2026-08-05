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
  User,
  Mail,
  Lock,
  Hourglass,
  ArrowRight,
  ShieldCheck,
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
  const [showJoinForm, setShowJoinForm] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    fetchSessionAndRequests();
  }, []);

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
        setFullName(sessionData.user.name || '');
        setEmail(sessionData.user.email || '');
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        if (Array.isArray(requestsData)) {
          setPendingRequests(requestsData);
        }
      }
    } catch (err) {
      // Unauthenticated access allowed for Join Organization page
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setAlreadySentAlert(null);
    setVerifiedOrg(null);
    setSelectedDesignationId('');

    if (!user) {
      if (!fullName.trim()) {
        setError('Full Name is required');
        return;
      }
      if (!email.trim()) {
        setError('Email Address is required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

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
        throw new Error(data.error || 'Invalid Organization Credentials');
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

      if (data.designations && data.designations.length > 0) {
        setSelectedDesignationId(data.designations[0].id);
      }

      if (!data.alreadySent) {
        setSuccess(`Organization Verified: ${data.organizationName}. Click "Submit Join Request" below to proceed.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify organization credentials');
    } finally {
      setVerifyingOrg(false);
    }
  };

  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!orgIdInput.trim() || !uniqueCodeInput.trim()) {
      setError('Both Organization ID and Unique Code are required');
      return;
    }

    if (!user) {
      if (!fullName.trim()) {
        setError('Full Name is required');
        return;
      }
      if (!email.trim()) {
        setError('Email Address is required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setSubmittingJoin(true);

    try {
      const payload: any = {
        orgId: orgIdInput.trim(),
        uniqueCode: uniqueCodeInput.trim(),
        designationId: selectedDesignationId || undefined,
      };

      if (!user) {
        payload.name = fullName.trim();
        payload.email = email.toLowerCase().trim();
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }

      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit join request');
      }

      setSuccess(
        data.message ||
          'Your account has been created successfully.\nYour request has been sent to the organization admins.\nYou will gain access after approval.'
      );
      setVerifiedOrg(null);
      setPassword('');
      setConfirmPassword('');
      fetchSessionAndRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to complete request');
    } finally {
      setSubmittingJoin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] text-[#244855] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#E64833] mx-auto" />
          <p className="text-xs font-bold text-[#244855]">Loading Join Organization workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner / Header */}
        <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFA896]/20 border border-[#244855]/10 flex items-center justify-center text-[#E64833] font-extrabold text-xl shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#244855]">Join Organization</h1>
              <p className="text-xs text-[#244855]/80 font-medium mt-0.5">
                Register your account and submit a join request using your Organization ID & Unique Code.
              </p>
            </div>
          </div>
          {user ? (
            <Link
              href="/member"
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-center shrink-0"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-outline px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-center shrink-0"
            >
              Sign In Instead
            </Link>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#9B1313] text-xs font-medium flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-3 whitespace-pre-line">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Pending Requests Banner for Logged In User */}
        {pendingRequests.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#244855] flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-[#E64833]" /> Active Join Requests ({pendingRequests.length})
              </h2>
            </div>

            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-4 shadow-soft"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#244855]/10 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E64833] block mb-0.5">
                      Request Status
                    </span>
                    <h3 className="text-lg font-extrabold text-[#244855]">
                      Joining Request Sent to {req.organizationName}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shrink-0 self-start sm:self-center">
                    <Clock className="w-3.5 h-3.5" /> PENDING APPROVAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FFA896]/10 border border-[#244855]/10">
                    <span className="text-[#244855]/70 block text-[10px] uppercase font-bold">
                      Organization
                    </span>
                    <span className="font-extrabold text-[#244855] text-sm mt-0.5 block">
                      {req.organizationName}
                    </span>
                    <span className="font-mono text-[#E64833] text-[11px] font-bold">
                      {req.orgIdCode || 'ID Pending'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFA896]/10 border border-[#244855]/10">
                    <span className="text-[#244855]/70 block text-[10px] uppercase font-bold">
                      Requested Designation
                    </span>
                    <span className="font-extrabold text-[#244855] text-sm mt-0.5 block">
                      {req.designationName}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFA896]/10 border border-[#244855]/10">
                    <span className="text-[#244855]/70 block text-[10px] uppercase font-bold">
                      Submitted Date
                    </span>
                    <span className="font-medium text-[#244855] text-sm mt-0.5 block font-mono">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#244855]/80 font-medium leading-relaxed pt-1">
                  Your request has been sent to the organization admins. You will gain access after approval.
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Join Organization Registration Form */}
        <section className="sit-card p-6 sm:p-8 bg-white border border-[#244855]/15 rounded-2xl space-y-6 shadow-soft">
          <div className="border-b border-[#244855]/10 pb-4">
            <h2 className="text-lg font-extrabold text-[#244855]">
              {user ? 'Submit Organization Join Request' : 'Join Organization'}
            </h2>
            <p className="text-xs text-[#244855]/80 font-medium mt-1">
              {user
                ? 'Enter Organization ID and Unique Code to apply to another organization.'
                : 'Create your account and apply to your organization by entering your credentials below.'}
            </p>
          </div>

          <form onSubmit={handleSubmitJoin} className="space-y-6">
            {/* Account Credentials (Only shown if unauthenticated) */}
            {!user && (
              <div className="space-y-4 border-b border-[#244855]/10 pb-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#E64833]">
                  1. Personal & Login Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#244855] uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#244855]/40" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#244855] uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#244855]/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#244855] uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#244855]/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full pl-10 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#244855] uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#244855]/40" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#244855]">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-[#244855]/30 text-[#E64833] focus:ring-0"
                    />
                    <span>Show password</span>
                  </label>
                </div>
              </div>
            )}

            {/* Organization Verification Credentials */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#E64833]">
                {user ? '1. Organization Identifiers' : '2. Organization Identifiers'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#244855] uppercase tracking-wider mb-1.5">
                    Organization ID * (e.g. ORG-1001)
                  </label>
                  <input
                    type="text"
                    required
                    value={orgIdInput}
                    onChange={(e) => setOrgIdInput(e.target.value.toUpperCase())}
                    placeholder="ORG-1001"
                    className="w-full px-4 py-3 rounded-xl sit-input font-mono text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#244855] uppercase tracking-wider mb-1.5">
                    Organization Unique Code * (e.g. K8P2X9F4)
                  </label>
                  <input
                    type="text"
                    required
                    value={uniqueCodeInput}
                    onChange={(e) => setUniqueCodeInput(e.target.value.toUpperCase())}
                    placeholder="K8P2X9F4"
                    className="w-full px-4 py-3 rounded-xl sit-input font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingJoin}
                className="btn-primary w-full py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {submittingJoin ? 'Creating Account & Submitting Request...' : 'Join Organization'}{' '}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="border-t border-[#244855]/10 pt-4 text-center text-xs text-[#244855]/80">
            Already have an approved organization account?{' '}
            <Link href="/login" className="text-[#E64833] font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
