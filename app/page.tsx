import Link from 'next/link';
import {
  Share2,
  Building2,
  BarChart3,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  LayoutDashboard,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Share2 className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                SOCIAL INTERACTION TRACKER
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                Enterprise Multi-Tenant SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-sm"
            >
              Login
            </Link>
            <Link
              href="/register-organization"
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/25 transition-all text-sm flex items-center gap-2"
            >
              Register Organization <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Enterprise-Grade Engagement Intelligence Platform
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-5xl mx-auto mb-6">
          Track Employee Social Media Engagement Across Your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Organization
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
          Streamline interaction tracking, verify employee participation across major social channels, gather real-time analytical reports, and maintain complete multi-tenant data isolation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register-organization"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-xl shadow-indigo-600/30 transition-all text-base flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all text-base flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5 text-indigo-400" /> Sign Up as Member
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 py-24 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Comprehensive Platform Capabilities
            </h2>
            <p className="text-slate-400 text-base">
              Built specifically for enterprises seeking actionable employee social media advocate reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How Social Interaction Tracker Works
          </h2>
          <p className="text-slate-400 text-base">
            From organization registration to detailed analytics in 5 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20">
                {step.number}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <Award className="w-4 h-4 text-purple-400" /> Executive Benefits
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                Empower Employee Advocacy & Measure Real Brand Reach
              </h2>
              <div className="space-y-4">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                    <CheckCircle2 className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">{b.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/30 via-slate-900 to-purple-900/30 border border-slate-800 shadow-2xl relative">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Live Platform Status</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                    All Systems Operational
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Total Interactions</span>
                    <p className="text-2xl font-black text-white mt-1">100% Verified</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400">Data Isolation</span>
                    <p className="text-2xl font-black text-indigo-400 mt-1">Strict Multi-Tenant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-300">SOCIAL INTERACTION TRACKER</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Sign Up
            </Link>
            <Link href="/register-organization" className="hover:text-white transition-colors">
              Organization Registration
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 Social Interaction Tracker (SIT). Enterprise Multi-Organization SaaS.
          </p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <Share2 className="w-6 h-6" />,
    title: 'Social Interaction Tracking',
    description: 'Track Facebook, Instagram, LinkedIn, and X likes, shares, comments, and reposts per post.',
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Multi-Organization Support',
    description: 'Isolated organization environments with individual ID, Unique Code, and custom designations.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Employee Analytics',
    description: 'Real-time charts and breakdown by platform, interaction type, and active employees.',
  },
  {
    icon: <FileSpreadsheet className="w-6 h-6" />,
    title: 'Excel Export',
    description: 'Generate formatted, comprehensive Excel reports of employee engagement with one click.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Post Management',
    description: 'Create, update, and manage trackable posts with multiline captions and media URLs.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Role Based Access Control',
    description: '5 hierarchical roles ensuring granular authorization from Super Admin to User.',
  },
  {
    icon: <LayoutDashboard className="w-6 h-6" />,
    title: 'Organization Dashboard',
    description: 'Dedicated administration portal for managing members, join requests, and designations.',
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Secure Cloud Storage',
    description: 'High-availability image uploads via Cloud Vercel Blob and persistent PostgreSQL DB.',
  },
];

const steps = [
  { number: '1', title: 'Register Organization', description: 'Submit official email and details on dedicated portal.' },
  { number: '2', title: 'Platform Approval', description: 'Super Admin approves and assigns unique Org ID & Code.' },
  { number: '3', title: 'Invite Employees', description: 'Employees join using Org ID and Code with dynamic designations.' },
  { number: '4', title: 'Track Engagement', description: 'Members record verified social media interactions.' },
  { number: '5', title: 'Analyze Results', description: 'Export detailed reports and inspect analytics dashboards.' },
];

const benefits = [
  { title: 'Zero Cross-Tenant Leakage', desc: 'Strict database and API query isolation between organizations.' },
  { title: 'Automated Super Admin Workflow', desc: 'Instant code generation and admin creation upon registration approval.' },
  { title: 'Dynamic Designation Management', desc: 'Custom organization designations protected against accidental deletion.' },
  { title: 'Duplicate Submission Protection', desc: 'Enforces unique interaction recording per employee post.' },
];
