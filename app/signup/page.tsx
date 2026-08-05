'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserSignUpPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/join-organization');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] flex items-center justify-center p-4 font-sans">
      <div className="text-center space-y-2">
        <p className="text-xs font-bold text-[#244855]">Redirecting to Join Organization...</p>
      </div>
    </div>
  );
}
