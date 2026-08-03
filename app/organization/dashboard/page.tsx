'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizationDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center font-sans">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-extrabold text-[#212A31]">Loading Organization Dashboard...</h2>
        <p className="text-xs text-[#2E3944] font-medium">Redirecting to your administration workspace.</p>
      </div>
    </div>
  );
}
