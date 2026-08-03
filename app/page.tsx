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
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans overflow-x-hidden selection:bg-[#124E66] selection:text-white">
      {/* Sticky Fixed Top Navigation Header */}
      <nav className="sticky top-0 z-50 w-full bg-[#212A31] text-white border-b border-[#2E3944] shadow-md">
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
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white hover:bg-[#2E3944] transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register-organization"
                  className="btn-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm"
                >
                  Register <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#748D92] text-[#124E66] text-xs font-bold shadow-sm mb-6">
          <Sparkles className="w-4 h-4 text-[#124E66]" />
          <span>Plan. Publish. Engage.</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#212A31] leading-tight max-w-4xl mx-auto mb-4">
          ClubHQ
        </h1>

        <p className="text-sm sm:text-base text-[#2E3944] max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          A collaborative platform that helps social teams, graphics teams and organization leaders manage content calendars, publish campaigns, track member engagement and measure community participation.
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
              className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register-organization"
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                Register Organization <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/signup"
                className="btn-secondary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Users className="w-4 h-4" /> Member Sign Up
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white border-y border-[#748D92]/40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#D3D9D4] border border-[#748D92] flex items-center justify-center text-[#212A31] font-bold mb-4">
                <Calendar className="w-5 h-5 text-[#124E66]" />
              </div>
              <h3 className="text-base font-extrabold text-[#212A31] mb-1">Content Calendar</h3>
              <p className="text-xs text-[#2E3944] font-medium leading-relaxed">
                Schedule campaign posters, manage social captions, and coordinate graphics workflows.
              </p>
            </div>

            <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#D3D9D4] border border-[#748D92] flex items-center justify-center text-[#212A31] font-bold mb-4">
                <FileText className="w-5 h-5 text-[#124E66]" />
              </div>
              <h3 className="text-base font-extrabold text-[#212A31] mb-1">Campaign Publishing</h3>
              <p className="text-xs text-[#2E3944] font-medium leading-relaxed">
                Publish posts, captions, and links directly to organization team members.
              </p>
            </div>

            <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#D3D9D4] border border-[#748D92] flex items-center justify-center text-[#212A31] font-bold mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#124E66]" />
              </div>
              <h3 className="text-base font-extrabold text-[#212A31] mb-1">Member Engagement</h3>
              <p className="text-xs text-[#2E3944] font-medium leading-relaxed">
                Members interact across channels and log verified participation proof.
              </p>
            </div>

            <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-[#D3D9D4] border border-[#748D92] flex items-center justify-center text-[#212A31] font-bold mb-4">
                <BarChart3 className="w-5 h-5 text-[#124E66]" />
              </div>
              <h3 className="text-base font-extrabold text-[#212A31] mb-1">Live Analytics</h3>
              <p className="text-xs text-[#2E3944] font-medium leading-relaxed">
                Real-time performance metrics and exportable community participation reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#212A31]">
            Simple 3-Step Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="sit-card p-6 bg-white border border-[#748D92] text-center rounded-2xl shadow-soft">
            <div className="w-8 h-8 rounded-full bg-[#124E66] text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <h3 className="text-sm font-extrabold text-[#212A31] mb-1">Plan & Schedule</h3>
            <p className="text-xs text-[#2E3944] font-medium">Social & graphics teams schedule campaign creatives.</p>
          </div>

          <div className="sit-card p-6 bg-white border border-[#748D92] text-center rounded-2xl shadow-soft">
            <div className="w-8 h-8 rounded-full bg-[#124E66] text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <h3 className="text-sm font-extrabold text-[#212A31] mb-1">Publish & Interact</h3>
            <p className="text-xs text-[#2E3944] font-medium">Members interact on platforms & log engagement proof.</p>
          </div>

          <div className="sit-card p-6 bg-white border border-[#748D92] text-center rounded-2xl shadow-soft">
            <div className="w-8 h-8 rounded-full bg-[#124E66] text-white font-bold text-xs flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <h3 className="text-sm font-extrabold text-[#212A31] mb-1">Measure & Report</h3>
            <p className="text-xs text-[#2E3944] font-medium">Track team performance & export analytics.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212A31] text-white border-t border-[#2E3944] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#748D92]">
          <p>© {new Date().getFullYear()} ClubHQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
