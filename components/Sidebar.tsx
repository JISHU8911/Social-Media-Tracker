'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  Building2,
  UserCheck,
  Briefcase,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
  organizationName?: string;
  onLogout?: () => void;
}

export default function Sidebar({
  userRole = 'MEMBER',
  userEmail,
  userName,
  organizationName,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSuperAdmin = userRole === 'PLATFORM_SUPER_ADMIN' || userRole === 'SUPER_ADMIN';
  const isAdmin =
    userRole === 'ORGANIZATION_SUPER_ADMIN' ||
    userRole === 'ORGANIZATION_ADMIN' ||
    userRole === 'ADMIN';

  const handleLogoutAction = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    }
  };

  const navItems = [
    ...(isSuperAdmin
      ? [{ name: 'Super Admin', href: '/super-admin', icon: Shield }]
      : []),
    ...(isAdmin
      ? [
          { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
          { name: 'Posts', href: '/admin/posts', icon: FileText },
          { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
          { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Members', href: '/admin/members', icon: UserCheck },
          { name: 'Designations', href: '/admin/designations', icon: Briefcase },
          { name: 'Join Requests', href: '/admin/join-requests', icon: Building2 },
        ]
      : [
          { name: 'Dashboard', href: '/member', icon: LayoutDashboard },
          { name: 'Calendar', href: '/member/calendar', icon: CalendarIcon },
          { name: 'Published Posts', href: '/member/posts', icon: FileText },
          { name: 'My Interactions', href: '/member/interactions', icon: UserCheck },
          { name: 'My Profile', href: '/profile', icon: Users },
        ]),
  ];

  const displayBrand = organizationName || 'ClubHQ';

  return (
    <aside className="w-64 bg-[#244855] text-white flex flex-col min-h-screen border-r border-white/10 shadow-lg">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-base tracking-tight text-white">
            {displayBrand}
          </h2>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#748D92]">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/member' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#124E66] text-white shadow-sm'
                  : 'text-slate-200 hover:bg-[#2E3944] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#748D92]'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-[#2E3944] bg-[#2E3944]">
        <div className="flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-bold text-white truncate">{userName || 'User Profile'}</p>
            <p className="text-[10px] text-[#748D92] truncate">{userEmail || userRole}</p>
          </div>
          <button
            onClick={handleLogoutAction}
            title="Log Out"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#124E66] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
