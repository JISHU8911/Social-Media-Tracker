'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, Key, CheckCircle, AlertCircle, RefreshCw, Send, ShieldCheck, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface DesignationItem {
  id: string;
  designationName: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Join form state
  const [orgIdInput, setOrgIdInput] = useState('');
  const [uniqueCodeInput, setUniqueCodeInput] = useState('');
  const [verifyingOrg, setVerifyingOrg] = useState(false);
  const [verifiedOrg, setVerifiedOrg] = useState<{
    organizationId: string;
    organizationName: string;
    orgIdCode: string;
    designations: DesignationItem[];
  } | null>(null);

  const [selectedDesignationId, setSelectedDesignationId] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleVerifyOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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

      setVerifiedOrg({
        organizationId: data.organizationId,
        organizationName: data.organizationName,
        orgIdCode: data.orgIdCode,
        designations: data.designations || [],
      });
      setSuccess(`Organization found: ${data.organizationName}. Please select your designation.`);
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

      setSuccess('Join request submitted successfully! Status: PENDING Organization Admin approval.');
      setVerifiedOrg(null);
      setOrgIdInput('');
      setUniqueCodeInput('');
      setSelectedDesignationId('');
      fetchSession();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmittingJoin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm text-slate-400">Loading profile workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Info Header */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user?.name}</h1>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                  Role: {user?.role}
                </span>
                {user?.organizationName && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Org: {user?.organizationName} ({user?.orgIdCode})
                  </span>
                )}
              </div>
            </div>
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

        {/* Join Organization Card (Sections 9 & 12) */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Join an Organization</h2>
              <p className="text-xs text-slate-400">
                Enter your Organization ID and Unique Code to dynamically load designations and submit a join request.
              </p>
            </div>
          </div>

          {!verifiedOrg ? (
            <form onSubmit={handleVerifyOrg} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Organization ID * (e.g. ORG-1001)
                  </label>
                  <input
                    type="text"
                    required
                    value={orgIdInput}
                    onChange={(e) => setOrgIdInput(e.target.value.toUpperCase())}
                    placeholder="ORG-1001"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Organization Unique Code * (e.g. K8P2X9F4)
                  </label>
                  <input
                    type="text"
                    required
                    value={uniqueCodeInput}
                    onChange={(e) => setUniqueCodeInput(e.target.value.toUpperCase())}
                    placeholder="K8P2X9F4"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifyingOrg}
                className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifyingOrg ? 'Verifying Credentials...' : 'Verify Organization'}
              </button>
            </form>
          ) : (
            /* Dynamic Designation Selection Form (Section 12) */
            <form onSubmit={handleSubmitJoin} className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-300 font-medium">Target Organization</span>
                  <h3 className="text-base font-bold text-white">{verifiedOrg.organizationName}</h3>
                  <span className="text-xs text-indigo-400 font-mono">ID: {verifiedOrg.orgIdCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifiedOrg(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Change Org
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Designation * (Mandatory)
                </label>
                <select
                  required
                  value={selectedDesignationId}
                  onChange={(e) => setSelectedDesignationId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                >
                  <option value="">-- Choose Designation --</option>
                  {verifiedOrg.designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.designationName}
                    </option>
                  ))}
                </select>
                {verifiedOrg.designations.length === 0 && (
                  <p className="text-xs text-amber-400 mt-2">
                    No active designations found for this organization. Please ask your Org Admin to create designations first.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingJoin || !selectedDesignationId}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingJoin ? 'Submitting Join Request...' : 'Submit Join Request'} <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
