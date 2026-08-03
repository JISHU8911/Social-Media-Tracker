'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, KeyRound, Terminal } from 'lucide-react';

export default function UserSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
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

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: 'MEMBER_SIGNUP',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');

      // DEVELOPMENT ONLY
      // Disable before production launch
      if (data.isTestMode) {
        setIsTestMode(true);
        setOtpCode('123456');
        setSuccessMsg('Development Mode Enabled - Use verification code: 123456');
      } else if (data.devCode) {
        setOtpCode(data.devCode);
        setSuccessMsg(`SMTP not configured in .env. Test code auto-filled: ${data.devCode}`);
      } else {
        setIsTestMode(false);
        setSuccessMsg(`Verification code sent to ${email.toLowerCase().trim()}`);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error sending verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setResending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          type: 'MEMBER_SIGNUP',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');

      // DEVELOPMENT ONLY
      // Disable before production launch
      if (data.isTestMode) {
        setIsTestMode(true);
        setOtpCode('123456');
        setSuccessMsg('Development Mode Enabled - Use verification code: 123456');
      } else if (data.devCode) {
        setOtpCode(data.devCode);
        setSuccessMsg(`Test code auto-filled: ${data.devCode}`);
      } else {
        setIsTestMode(false);
        setSuccessMsg(`New 6-digit code sent to ${email.toLowerCase().trim()}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          confirmPassword,
          otpCode: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      router.push('/member');
    } catch (err: any) {
      setError(err.message || 'Error completing signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-xl font-extrabold text-[#212A31]">ClubHQ</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#212A31]">
            {step === 1 ? 'Create Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs sm:text-sm text-[#2E3944] mt-1 font-medium">
            {step === 1
              ? 'Sign up with verified email access.'
              : `Enter the 6-digit OTP code sent to ${email}`}
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

          {successMsg && !isTestMode && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-11 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl sit-input text-xs font-medium"
                  />
                </div>
              </div>

              <div className="text-xs text-[#2E3944]">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-[#748D92] text-[#124E66] focus:ring-0"
                  />
                  <span>Show passwords</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndSignup} className="space-y-5">
              <div className="p-4 rounded-xl bg-[#D3D9D4]/50 border border-[#748D92]/40 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#2E3944] block">
                  Verification Code Sent To
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
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl sit-input text-center text-lg font-mono font-bold tracking-widest text-[#212A31]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Email & Complete Sign Up'}{' '}
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs border-t border-[#748D92]/30 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[#2E3944] hover:text-[#212A31] font-semibold"
                >
                  ← Edit Form Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[#124E66] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-[#748D92]/30 pt-4 text-center text-xs text-[#2E3944]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#124E66] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
