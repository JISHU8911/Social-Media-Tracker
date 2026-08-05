'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  CheckCircle2,
  ArrowRight,
  Users,
  Calendar,
  Sparkles,
  Building2,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          const role = data.user.role;
          const orgId = data.user.organizationId;
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
          }
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans overflow-x-hidden selection:bg-[#E64833] selection:text-white">
      {/* Sticky Fixed Top Navigation Header */}
      <nav className="sticky top-0 z-50 w-full bg-[#244855] text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white">
              ClubHQ
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={
                  user.role === 'PLATFORM_SUPER_ADMIN' || user.role === 'SUPER_ADMIN'
                    ? '/super-admin'
                    : user.role === 'ORGANIZATION_SUPER_ADMIN' ||
                      user.role === 'ORGANIZATION_ADMIN' ||
                      user.role === 'ADMIN' ||
                      user.organizationId
                    ? '/admin'
                    : user.role === 'MEMBER'
                    ? '/member'
                    : '/profile'
                }
                className="btn-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/join-organization"
                  className="btn-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Join Organization <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-14 sm:pt-22 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#244855]/15 text-[#E64833] text-xs font-bold shadow-sm mb-6">
          <Sparkles className="w-4 h-4 text-[#E64833]" />
          <span>Plan. Publish. Engage.</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#244855] leading-tight max-w-4xl mx-auto mb-4">
          ClubHQ
        </h1>

        <p className="text-sm sm:text-base text-[#244855]/80 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          A collaborative social media management platform that helps organization teams manage content calendars, publish campaign posts, track member engagement, and measure participation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {user ? (
            <Link
              href={
                user.role === 'PLATFORM_SUPER_ADMIN' || user.role === 'SUPER_ADMIN'
                  ? '/super-admin'
                  : user.role === 'ORGANIZATION_SUPER_ADMIN' ||
                    user.role === 'ORGANIZATION_ADMIN' ||
                    user.role === 'ADMIN' ||
                    user.organizationId
                  ? '/admin'
                  : user.role === 'MEMBER'
                  ? '/member'
                  : '/profile'
              }
              className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-secondary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                Sign In
              </Link>
              <Link
                href="/join-organization"
                className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Building2 className="w-4 h-4" /> Join Organization <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 sm:py-18 bg-[#FFA896]/10 border-y border-[#244855]/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl shadow-soft">
              <div className="w-11 h-11 rounded-2xl bg-[#FFA896]/20 border border-[#244855]/10 flex items-center justify-center text-[#E64833] font-bold mb-4">
                <Calendar className="w-5 h-5 text-[#E64833]" />
              </div>
              <h3 className="text-base font-extrabold text-[#244855] mb-1">Content Calendar</h3>
              <p className="text-xs text-[#244855]/80 font-medium leading-relaxed">
                Schedule campaign posters, manage social captions, and coordinate graphics workflows.
              </p>
            </div>

            <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl shadow-soft">
              <div className="w-11 h-11 rounded-2xl bg-[#FFA896]/20 border border-[#244855]/10 flex items-center justify-center text-[#E64833] font-bold mb-4">
                <FileText className="w-5 h-5 text-[#E64833]" />
              </div>
              <h3 className="text-base font-extrabold text-[#244855] mb-1">Campaign Publishing</h3>
              <p className="text-xs text-[#244855]/80 font-medium leading-relaxed">
                Publish posts, captions, and links directly to organization team members.
              </p>
            </div>

            <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl shadow-soft">
              <div className="w-11 h-11 rounded-2xl bg-[#FFA896]/20 border border-[#244855]/10 flex items-center justify-center text-[#E64833] font-bold mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#E64833]" />
              </div>
              <h3 className="text-base font-extrabold text-[#244855] mb-1">Member Engagement</h3>
              <p className="text-xs text-[#244855]/80 font-medium leading-relaxed">
                Members interact across channels and log verified participation proof.
              </p>
            </div>

            <div className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl shadow-soft">
              <div className="w-11 h-11 rounded-2xl bg-[#FFA896]/20 border border-[#244855]/10 flex items-center justify-center text-[#E64833] font-bold mb-4">
                <BarChart3 className="w-5 h-5 text-[#E64833]" />
              </div>
              <h3 className="text-base font-extrabold text-[#244855] mb-1">Live Analytics</h3>
              <p className="text-xs text-[#244855]/80 font-medium leading-relaxed">
                Real-time performance metrics and exportable community participation reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#244855]">
            Simple 3-Step Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="sit-card p-6 bg-white border border-[#244855]/15 text-center rounded-2xl shadow-soft">
            <div className="w-9 h-9 rounded-full bg-[#E64833] text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h3 className="text-sm font-extrabold text-[#244855] mb-1">Plan & Schedule</h3>
            <p className="text-xs text-[#244855]/80 font-medium">Social & graphics teams schedule campaign media.</p>
          </div>

          <div className="sit-card p-6 bg-white border border-[#244855]/15 text-center rounded-2xl shadow-soft">
            <div className="w-9 h-9 rounded-full bg-[#E64833] text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h3 className="text-sm font-extrabold text-[#244855] mb-1">Publish & Interact</h3>
            <p className="text-xs text-[#244855]/80 font-medium">Members interact on platforms & log engagement proof.</p>
          </div>

          <div className="sit-card p-6 bg-white border border-[#244855]/15 text-center rounded-2xl shadow-soft">
            <div className="w-9 h-9 rounded-full bg-[#E64833] text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h3 className="text-sm font-extrabold text-[#244855] mb-1">Measure & Report</h3>
            <p className="text-xs text-[#244855]/80 font-medium">Track team performance & export analytics.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#244855] text-white border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-white/70">
          <p>© {new Date().getFullYear()} ClubHQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
