'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Share2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      const role = data.user?.role;
      const orgId = data.user?.organizationId;

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              SOCIAL INTERACTION TRACKER
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Sign In to Platform</h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your organization engagement workspace.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Show password</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Please contact your Organization Administrator or Support to reset your password.');
                }}
                className="text-indigo-400 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-4 flex flex-col gap-2 text-center text-xs text-slate-400">
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-400 hover:underline font-medium">
                Sign Up
              </Link>
            </div>
            <div>
              Want to register an organization?{' '}
              <Link href="/register-organization" className="text-indigo-400 hover:underline font-medium">
                Register Organization
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
