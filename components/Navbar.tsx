'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Users,
  LogOut,
  PlusCircle,
  Key,
  X as CloseIcon,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Activity,
  ShieldAlert,
  Share2,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    organizationName?: string | null;
    orgIdCode?: string | null;
  } | null>(null);

  // Change Password Modal State
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPwError('New Password and Confirm Password do not match.');
      return;
    }

    setPwLoading(true);
    setPwError(null);
    setPwSuccess(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPwSuccess(data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setChangePwOpen(false);
        setPwSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPwError(err.message);
    } fontinally: {
      setPwLoading(false);
    }
  };

  // Build role-aware navigation links
  let navItems: { href: string; label: string; icon: any }[] = [];

  if (user?.role === 'PLATFORM_SUPER_ADMIN') {
    navItems = [
      { href: '/super-admin', label: 'Super Admin HQ', icon: ShieldAlert },
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/posts', label: 'Posts', icon: FileText },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ];
  } else if (
    user?.role === 'ORGANIZATION_SUPER_ADMIN' ||
    user?.role === 'ORGANIZATION_ADMIN'
  ) {
    navItems = [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/posts', label: 'Posts', icon: FileText },
      { href: '/admin/designations', label: 'Designations', icon: Briefcase },
      { href: '/admin/join-requests', label: 'Join Requests', icon: UserCheck },
      { href: '/admin/members', label: 'Members', icon: Users },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ];
  } else if (user?.role === 'MEMBER') {
    navItems = [
      { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/member/history', label: 'My Activity', icon: Activity },
    ];
  } else {
    navItems = [
      { href: '/profile', label: 'Join Organization', icon: Building2 },
    ];
  }

  const isOrgAdminUser =
    user?.role === 'ORGANIZATION_SUPER_ADMIN' ||
    user?.role === 'ORGANIZATION_ADMIN' ||
    user?.role === 'PLATFORM_SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight">
                  SOCIAL INTERACTION TRACKER
                </span>
                {user?.organizationName ? (
                  <span className="text-[10px] text-indigo-400 font-semibold font-mono">
                    {user.organizationName} ({user.orgIdCode})
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Enterprise SaaS Platform
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-3">
            {isOrgAdminUser && (
              <Link
                href="/admin/posts/new"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Post</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 uppercase">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => setChangePwOpen(true)}
                  title="Change Password"
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Key className="h-4 w-4" />
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  href="/register-organization"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Register Org
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Links */}
        {user && (
          <nav className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Change Password Modal */}
      {changePwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-slate-100">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Change Password</h3>
              </div>
              <button
                onClick={() => setChangePwOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {pwError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    aria-label={showNewPw ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setChangePwOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
                >
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
