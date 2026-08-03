'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Terminal, KeyRound, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your registered email address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: 'FORGOT_PASSWORD',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');

      // DEVELOPMENT ONLY
      // Disable before production launch
      if (data.isTestMode) {
        setIsTestMode(true);
        setResetCode('123456');
      } else {
        setIsTestMode(false);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          code: resetCode.trim(),
          type: 'FORGOT_PASSWORD',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error verifying reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold text-[#212A31]">ClubHQ</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#212A31]">Reset Your Password</h1>
          <p className="text-sm text-[#2E3944] mt-1 font-medium">
            {step === 1 ? 'Enter your email to receive a password reset verification code.' : 'Enter the 6-digit code to verify your identity.'}
          </p>
        </div>

        <div className="sit-card p-6 sm:p-8 bg-white border border-[#748D92] rounded-2xl shadow-soft space-y-4">
          {/* DEVELOPMENT ONLY - Test mode banner */}
          {isTestMode && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 text-xs font-bold flex items-center gap-2 shadow-sm">
              <Terminal className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Development Mode Enabled - Use verification code: <code className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-950 font-mono text-xs">123456</code></span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#212A31]">Identity Verified</h3>
              <p className="text-xs text-[#2E3944] font-medium leading-relaxed">
                Verification complete for <strong className="font-mono">{email}</strong>. You may now return to sign in.
              </p>
              <div className="pt-4 border-t border-[#748D92]/30">
                <Link
                  href="/login"
                  className="btn-primary w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md"
                >
                  Return to Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSendResetCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}{' '}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-[#748D92]/30 text-center">
                <Link href="/login" className="text-xs font-bold text-[#124E66] hover:underline">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyResetCode} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#D3D9D4]/50 border border-[#748D92]/40 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#2E3944] block">
                  Verification Code Dispatched To
                </span>
                <span className="text-sm font-extrabold text-[#212A31] block truncate font-mono">
                  {email}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Code *
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl sit-input text-center text-lg font-mono font-bold tracking-widest text-[#212A31]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || resetCode.length !== 6}
                className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? 'Verifying Code...' : 'Verify Code & Reset Password'}{' '}
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#748D92]/30 text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-[#124E66] hover:underline"
                >
                  ← Back to Email Input
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
