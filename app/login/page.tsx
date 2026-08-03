'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      const role = data.user.role;
      const orgId = data.user.organizationId;

      if (role === 'PLATFORM_SUPER_ADMIN' || role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (
        role === 'ORGANIZATION_SUPER_ADMIN' ||
        role === 'ORGANIZATION_ADMIN' ||
        role === 'ADMIN' ||
        Boolean(orgId)
      ) {
        router.push('/admin');
      } else if (role === 'MEMBER') {
        router.push('/member');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
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
          <h1 className="text-2xl font-extrabold text-[#212A31]">Welcome Back</h1>
          <p className="text-sm text-[#2E3944] mt-1 font-medium">Sign in to access your organization workspace.</p>
        </div>

        <div className="sit-card p-6 sm:p-8 bg-white border border-[#748D92] rounded-2xl shadow-soft">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="admin@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl sit-input text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider">
                  Password *
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#124E66] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#748D92]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl sit-input text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#748D92] hover:text-[#212A31]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-[#748D92]/30 pt-4 text-center text-xs text-[#2E3944] space-y-2">
            <p>
              Don&apos;t have a member account?{' '}
              <Link href="/signup" className="text-[#124E66] font-bold hover:underline">
                Sign Up
              </Link>
            </p>
            <p>
              Need an organization workspace?{' '}
              <Link href="/register-organization" className="text-[#124E66] font-bold hover:underline">
                Register Organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
