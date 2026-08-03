'use client';

import Link from 'next/link';
import { MailCheck, ArrowRight } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <span className="text-xl font-extrabold text-[#212A31]">ClubHQ</span>
        </Link>

        <div className="sit-card p-8 bg-white border border-[#748D92] rounded-2xl shadow-soft space-y-6">
          <div className="w-16 h-16 bg-[#D3D9D4] border border-[#748D92] text-[#124E66] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <MailCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-[#212A31]">Verify Your Email</h1>
            <p className="text-xs sm:text-sm text-[#2E3944] font-medium leading-relaxed">
              We sent a verification link to your registered official email address. Please click the link to activate your workspace access.
            </p>
          </div>

          <div className="pt-4 border-t border-[#748D92]/30 space-y-3">
            <Link href="/login" className="btn-primary w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 shadow-md">
              Proceed to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-[#748D92] font-medium">
              Didn&apos;t receive an email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
