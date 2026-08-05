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
  X as CloseIcon,
  UserCheck,
  Building2,
  Activity,
  ShieldAlert,
  Calendar as CalendarIcon,
  Menu,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    organizationId?: string | null;
    organizationName?: string | null;
    organizationLogo?: string | null;
    orgIdCode?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const brandName = user?.organizationName || 'ClubHQ';
  const logoUrl = user?.organizationLogo || null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = brandName;
    }
  }, [brandName]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Build role-aware navigation links
  let navItems: { href: string; label: string; icon: any }[] = [];

  const hasOrganization = Boolean(user?.organizationId);

  if (user?.role === 'PLATFORM_SUPER_ADMIN' || user?.role === 'SUPER_ADMIN') {
    navItems = [
      { href: '/super-admin', label: 'Super Admin', icon: ShieldAlert },
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarIcon },
      { href: '/admin/posts', label: 'Posts', icon: FileText },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ];
  } else if (
    hasOrganization &&
    (user?.role === 'ORGANIZATION_SUPER_ADMIN' ||
      user?.role === 'ORGANIZATION_ADMIN' ||
      user?.role === 'ADMIN')
  ) {
    navItems = [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarIcon },
      { href: '/admin/posts', label: 'Posts', icon: FileText },
      { href: '/admin/designations', label: 'Designations', icon: Briefcase },
      { href: '/admin/join-requests', label: 'Join Requests', icon: UserCheck },
      { href: '/admin/members', label: 'Members', icon: Users },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ];
  } else if (hasOrganization) {
    // Verified Organization Member
    navItems = [
      { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/member/calendar', label: 'Calendar', icon: CalendarIcon },
      { href: '/member/posts', label: 'Published Posts', icon: Sparkles },
      { href: '/member/interactions', label: 'My Interactions', icon: Activity },
      { href: '/profile', label: 'Profile', icon: Building2 },
    ];
  } else {
    // Non-organization member: strictly Dashboard, Join Organization, Profile
    navItems = [
      { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/join-organization', label: 'Join Organization', icon: Building2 },
      { href: '/profile', label: 'Profile', icon: UserCheck },
    ];
  }

  const isOrgAdminUser =
    hasOrganization &&
    (user?.role === 'ORGANIZATION_SUPER_ADMIN' ||
      user?.role === 'ORGANIZATION_ADMIN' ||
      user?.role === 'PLATFORM_SUPER_ADMIN' ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN');

  return (
    <header className="sticky top-0 z-50 w-full bg-[#244855] text-white shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-8 w-8 object-contain rounded-lg bg-white/10 p-0.5 border border-white/10"
                />
              ) : (
                <Building2 className="h-5 w-5 text-[#E64833]" />
              )}
              <span className="text-lg font-extrabold text-white tracking-tight">
                {brandName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#E64833] text-white shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isOrgAdminUser && (
              <Link
                href="/admin/posts/new"
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-primary shadow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Post</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-white/15">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-white max-w-[130px] truncate">{user.name}</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/15 text-white uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl"
                  title="Toggle Menu"
                >
                  {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/join-organization"
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                >
                  Join Organization
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer / Menu */}
        {(mobileMenuOpen || user) && (
          <nav className={`${mobileMenuOpen ? 'block' : 'hidden lg:hidden'} py-3 space-y-1 border-t border-white/10`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold ${
                      isActive
                        ? 'bg-[#E64833] text-white shadow-sm'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
