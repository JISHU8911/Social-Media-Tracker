'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { OrganizationMembersContent } from '@/components/admin/OrganizationMembersContent';
import { OrganizationJoinRequestsContent } from '@/components/admin/OrganizationJoinRequestsContent';
import { DesignationsManagementContent } from '@/components/admin/DesignationsManagementContent';
import { Users, UserCheck, Briefcase, ShieldAlert, RefreshCw } from 'lucide-react';

function AdminPanelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'members' | 'join-requests' | 'designations'>(
    tabParam === 'join-requests' || tabParam === 'designations' ? tabParam : 'members'
  );

  useEffect(() => {
    if (tabParam === 'join-requests' || tabParam === 'designations' || tabParam === 'members') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'members' | 'join-requests' | 'designations') => {
    setActiveTab(tab);
    router.replace(`/admin/panel?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Unified Tab Bar */}
        <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#124E66] mb-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Organization Management Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
                Admin Panel
              </h1>
              <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
                Unified workspace administration for organization members, join requests, and designation settings.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[#748D92]/30 pt-4">
            <button
              onClick={() => handleTabChange('members')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'members'
                  ? 'bg-[#124E66] text-white shadow-md'
                  : 'bg-[#D3D9D4]/50 text-[#212A31] hover:bg-[#D3D9D4] border border-[#748D92]/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members Roster</span>
            </button>

            <button
              onClick={() => handleTabChange('join-requests')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'join-requests'
                  ? 'bg-[#124E66] text-white shadow-md'
                  : 'bg-[#D3D9D4]/50 text-[#212A31] hover:bg-[#D3D9D4] border border-[#748D92]/40'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Join Requests</span>
            </button>

            <button
              onClick={() => handleTabChange('designations')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'designations'
                  ? 'bg-[#124E66] text-white shadow-md'
                  : 'bg-[#D3D9D4]/50 text-[#212A31] hover:bg-[#D3D9D4] border border-[#748D92]/40'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Designations</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="space-y-6">
          {activeTab === 'members' && (
            <div className="animate-fadeIn">
              <OrganizationMembersContent hideNavbar={true} />
            </div>
          )}

          {activeTab === 'join-requests' && (
            <div className="animate-fadeIn">
              <OrganizationJoinRequestsContent hideNavbar={true} />
            </div>
          )}

          {activeTab === 'designations' && (
            <div className="animate-fadeIn">
              <DesignationsManagementContent hideNavbar={true} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function UnifiedAdminPanelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center font-sans">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#124E66] mx-auto" />
            <p className="text-xs font-bold text-[#2E3944]">Loading Admin Panel...</p>
          </div>
        </div>
      }
    >
      <AdminPanelContent />
    </Suspense>
  );
}
