'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md text-center space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <span className="text-xl font-extrabold text-[#212A31]">ClubHQ</span>
        </Link>

        <div className="sit-card p-8 bg-white border border-[#748D92] rounded-2xl shadow-soft space-y-6">
          <div className="w-16 h-16 bg-[#D3D9D4] border border-[#748D92] text-[#124E66] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#212A31]">404 - Page Not Found</h1>
            <p className="text-xs sm:text-sm text-[#2E3944] font-medium leading-relaxed">
              The page or resource you requested could not be found or has been moved.
            </p>
          </div>

          <div className="pt-4 border-t border-[#748D92]/30">
            <Link
              href="/"
              className="btn-primary w-full py-3.5 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md"
            >
              Return to Homepage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
