'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (!data.user.organizationId && data.user.role !== 'PLATFORM_SUPER_ADMIN' && data.user.role !== 'SUPER_ADMIN') {
            alert('Join an organization to access organization resources.');
            router.push('/join-organization');
          } else {
            router.push('/member/calendar');
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center font-sans">
      <div className="text-xs font-bold text-[#2E3944]">Redirecting to Content Calendar...</div>
    </div>
  );
}
