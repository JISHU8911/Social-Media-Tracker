'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CalendarView from '@/components/CalendarView';

export default function MemberCalendarPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          if (!data.user.organizationId && data.user.role !== 'PLATFORM_SUPER_ADMIN' && data.user.role !== 'SUPER_ADMIN') {
            alert('Join an organization to access organization resources.');
            router.push('/join-organization');
            return;
          }
          setUserRole(data.user.role);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center font-sans">
        <div className="text-xs font-bold text-[#2E3944]">Loading Content Calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalendarView userRole={userRole} canManage={false} />
      </main>
    </div>
  );
}
