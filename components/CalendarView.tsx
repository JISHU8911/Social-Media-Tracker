'use client';

import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  List,
  Grid,
  CalendarDays,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Info,
  Building2,
  FileText,
  AlignLeft,
} from 'lucide-react';

export interface CalendarEntryData {
  id: string;
  organizationId: string;
  title: string;
  date: string;
  targetTime: string;
  status: 'PLANNED' | 'POSTER_READY' | 'POSTED' | 'CANCELLED' | 'DELAYED';
  creativeUrl?: string | null;
  creativeType?: 'IMAGE' | 'VIDEO' | null;
  caption?: string | null;
  actualPostedDate?: string | null;
  actualPostedTime?: string | null;
  cancellationReason?: string | null;
  newDate?: string | null;
  newTargetTime?: string | null;
  delayReason?: string | null;
  createdBy: string;
  createdAt: string;
}

interface CalendarViewProps {
  userRole: string; // 'ORGANIZATION_SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'MEMBER' | 'PLATFORM_SUPER_ADMIN'
  canManage: boolean; // True for Admins/Super Admins
}

// Local date string helper (YYYY-MM-DD) to fix Date Shift bug completely
function toLocalDateString(dateInput: Date | string): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const d = new Date(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const year = dateInput.getFullYear();
  const month = String(dateInput.getMonth() + 1).padStart(2, '0');
  const day = String(dateInput.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CalendarView({ userRole, canManage }: CalendarViewProps) {
  const [entries, setEntries] = useState<CalendarEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState<string>('ClubHQ');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntryData | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form states for Creation
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(toLocalDateString(new Date()));
  const [newTargetTime, setNewTargetTime] = useState('12:00');
  const [newStatus, setNewStatus] = useState<string>('PLANNED');
  const [newCaption, setNewCaption] = useState('');

  // Form states for Status Update Modal
  const [updateStatus, setUpdateStatus] = useState<string>('POSTER_READY');
  const [creativeUrl, setCreativeUrl] = useState<string>('');
  const [creativeType, setCreativeType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [caption, setCaption] = useState<string>('');
  const [actualPostedDate, setActualPostedDate] = useState(toLocalDateString(new Date()));
  const [actualPostedTime, setActualPostedTime] = useState('12:00');
  const [cancellationReason, setCancellationReason] = useState('');
  const [delayedNewDate, setDelayedNewDate] = useState(toLocalDateString(new Date()));
  const [delayedNewTargetTime, setDelayedNewTargetTime] = useState('12:00');
  const [delayReason, setDelayReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.organizationName) {
          setOrgName(data.user.organizationName);
        }
      })
      .catch(() => {});
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      if (!res.ok) throw new Error('Failed to fetch calendar');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newTargetTime) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          date: newDate,
          targetTime: newTargetTime,
          status: newStatus,
          caption: newCaption.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create entry');

      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewCaption('');
      fetchEntries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    if (updateStatus === 'POSTER_READY' && !creativeUrl) {
      setError('Please upload a Poster Image or Poster Video');
      return;
    }
    if (updateStatus === 'CANCELLED' && !cancellationReason.trim()) {
      setError('Cancellation reason is required');
      return;
    }
    if (updateStatus === 'DELAYED' && !delayReason.trim()) {
      setError('Delay reason is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        status: updateStatus,
        caption: caption !== undefined ? caption : undefined,
      };

      if (updateStatus === 'POSTER_READY') {
        payload.creativeUrl = creativeUrl;
        payload.creativeType = creativeType;
      } else if (updateStatus === 'POSTED') {
        payload.actualPostedDate = actualPostedDate;
        payload.actualPostedTime = actualPostedTime;
      } else if (updateStatus === 'CANCELLED') {
        payload.cancellationReason = cancellationReason.trim();
      } else if (updateStatus === 'DELAYED') {
        payload.newDate = delayedNewDate;
        payload.newTargetTime = delayedNewTargetTime;
        payload.delayReason = delayReason.trim();
      }

      const res = await fetch(`/api/calendar/${selectedEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setIsStatusModalOpen(false);
      setSelectedEntry(null);
      fetchEntries();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete calendar entry "${title}"?`)) return;
    try {
      const res = await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete entry');
      }
      fetchEntries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // FIX 2: Open Status Modal cleanly without modal stacking!
  const openStatusModal = (entry: CalendarEntryData) => {
    setIsDetailModalOpen(false); // Close details modal first!
    setSelectedEntry(entry);
    setUpdateStatus(entry.status === 'PLANNED' ? 'POSTER_READY' : entry.status);
    setCreativeUrl(entry.creativeUrl || '');
    setCreativeType(entry.creativeType || 'IMAGE');
    setCaption(entry.caption || '');
    setActualPostedDate(
      entry.actualPostedDate
        ? toLocalDateString(entry.actualPostedDate)
        : toLocalDateString(new Date())
    );
    setActualPostedTime(entry.actualPostedTime || '12:00');
    setCancellationReason(entry.cancellationReason || '');
    setDelayedNewDate(
      entry.newDate
        ? toLocalDateString(entry.newDate)
        : toLocalDateString(new Date())
    );
    setDelayedNewTargetTime(entry.newTargetTime || '12:00');
    setDelayReason(entry.delayReason || '');
    setError(null);
    setIsStatusModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'POSTER_READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500 text-white shadow-sm">
            <FileCheck className="h-3 w-3" />
            <span>POSTER READY</span>
          </span>
        );
      case 'POSTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="h-3 w-3" />
            <span>POSTED</span>
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm">
            <AlertTriangle className="h-3 w-3" />
            <span>DELAYED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-600 text-white shadow-sm">
            <XCircle className="h-3 w-3" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#748D92]/30 text-[#212A31] border border-[#748D92]">
            <Clock className="h-3 w-3 text-[#212A31]" />
            <span>PLANNED</span>
          </span>
        );
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'POSTER_READY':
        return 'border-l-4 border-l-blue-500';
      case 'POSTED':
        return 'border-l-4 border-l-emerald-600';
      case 'DELAYED':
        return 'border-l-4 border-l-amber-500';
      case 'CANCELLED':
        return 'border-l-4 border-l-rose-600';
      default:
        return 'border-l-4 border-l-slate-400';
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const filteredEntries = entries.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }
  const remainingDays = 42 - calendarDays.length;
  for (let d = 1; d <= remainingDays; d++) {
    calendarDays.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 text-[#244855] font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#244855] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#E64833]" /> {orgName} Campaign Calendar
          </h1>
          <p className="text-xs text-[#244855]/80 font-medium mt-1">
            Schedule social media posters, manage captions, and track posting workflows.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setNewDate(toLocalDateString(new Date()));
              setIsCreateModalOpen(true);
            }}
            className="btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Calendar Entry
          </button>
        )}
      </div>

      {/* Control Bar: Filters & Views */}
      <div className="sit-card p-4 bg-white border border-[#244855]/15 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-soft">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#FFA896]/15 rounded-xl p-1 border border-[#244855]/10">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-[#244855] transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={todayMonth}
              className="px-3 py-1 text-xs font-bold text-[#244855] hover:bg-white rounded-lg transition-all"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-[#244855] transition-all"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="text-base font-extrabold text-[#244855] pl-2">
            {monthNames[month]} {year}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#244855]/40" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl sit-input text-xs font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl sit-input text-xs font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">PLANNED</option>
            <option value="POSTER_READY">POSTER READY</option>
            <option value="POSTED">POSTED</option>
            <option value="DELAYED">DELAYED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Month View Grid */}
      <div className="sit-card bg-white border border-[#244855]/15 rounded-2xl overflow-hidden shadow-soft">
        <div className="grid grid-cols-7 border-b border-white/10 bg-[#244855] text-white text-center text-xs font-extrabold py-3 uppercase tracking-wider">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#244855]/10 bg-white">
          {calendarDays.map((day, idx) => {
            const dayStr = toLocalDateString(day.date);
            const isToday = dayStr === toLocalDateString(new Date());

            const dayEntries = filteredEntries.filter(
              (e) => toLocalDateString(e.date) === dayStr
            );

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 transition-all ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-[#FFA896]/5 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                      isToday
                        ? 'bg-[#E64833] text-white shadow-sm'
                        : day.isCurrentMonth
                        ? 'text-[#244855]'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {dayEntries.length > 0 && (
                    <span className="text-[10px] font-bold text-[#244855]/70">
                      {dayEntries.length} {dayEntries.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsDetailModalOpen(true);
                      }}
                      className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all hover:scale-[1.02] bg-white border border-[#244855]/15 shadow-sm ${getStatusBorderColor(
                        entry.status
                      )}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-[#244855] truncate text-[11px]">
                          {entry.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#244855]/70 font-semibold flex-shrink-0">
                          {entry.targetTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        {entry.creativeUrl ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                            Media: Uploaded
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                            Media: Pending
                          </span>
                        )}

                        {entry.caption ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                            Caption: Added
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                            Caption: Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE CALENDAR ENTRY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212A31]/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg sit-card bg-white border border-[#748D92] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#748D92]/30 bg-[#D3D9D4]/50">
              <h3 className="text-sm font-extrabold text-[#212A31]">Create Campaign Entry</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-[#212A31]/60 hover:text-[#212A31] rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                  Title <span className="text-[#124E66]">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Independence Day Special Poster"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                    Date <span className="text-[#124E66]">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                  />
                </div>

                {/* ADD 2: Standard Clean Time Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                    Target Time <span className="text-[#124E66]">*</span>
                  </label>
                  <input
                    type="time"
                    value={newTargetTime}
                    onChange={(e) => setNewTargetTime(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                  />
                </div>
              </div>

              {/* ADD 1: Independent Caption Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider flex items-center justify-between">
                  <span>Caption (Social Team)</span>
                  <span className="text-[10px] text-[#2E3944] font-normal lowercase">Optional</span>
                </label>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  rows={3}
                  placeholder="Write campaign caption text, hashtags, and social copy..."
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                  Initial Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="POSTER_READY">POSTER READY</option>
                  <option value="POSTED">POSTED</option>
                  <option value="DELAYED">DELAYED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-[#748D92]/30">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL (Independent Media & Caption Workflow) */}
      {isStatusModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212A31]/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg sit-card bg-white border border-[#748D92] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#748D92]/30 bg-[#D3D9D4]/50 sticky top-0 z-10">
              <div>
                <h3 className="text-sm font-extrabold text-[#212A31]">Update Calendar Entry</h3>
                <p className="text-xs text-[#2E3944] font-medium">{selectedEntry.title}</p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 text-[#212A31]/60 hover:text-[#212A31] rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                  Select Workflow Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpdateStatus('POSTER_READY')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 text-xs font-bold transition-all ${
                      updateStatus === 'POSTER_READY'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-[#748D92]/60 hover:bg-[#D3D9D4]/30 text-[#212A31]'
                    }`}
                  >
                    <FileCheck className="h-4 w-4 text-blue-500" />
                    <span>POSTER READY</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateStatus('POSTED')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 text-xs font-bold transition-all ${
                      updateStatus === 'POSTED'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-[#748D92]/60 hover:bg-[#D3D9D4]/30 text-[#212A31]'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>POSTED</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateStatus('DELAYED')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 text-xs font-bold transition-all ${
                      updateStatus === 'DELAYED'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-[#748D92]/60 hover:bg-[#D3D9D4]/30 text-[#212A31]'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>DELAYED</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateStatus('CANCELLED')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 text-xs font-bold transition-all ${
                      updateStatus === 'CANCELLED'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                        : 'border-[#748D92]/60 hover:bg-[#D3D9D4]/30 text-[#212A31]'
                    }`}
                  >
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>CANCELLED</span>
                  </button>
                </div>
              </div>

              {/* ADD 1 & 5: Social Team Caption Management */}
              <div className="space-y-1 pt-2 border-t border-[#748D92]/30">
                <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider flex items-center justify-between">
                  <span>Social Team: Caption Text</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="Manage campaign caption, post hashtags, or copy..."
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              {/* FIX 5: Media Upload strictly available to Admins / Graphics team */}
              {canManage && updateStatus === 'POSTER_READY' && (
                <div className="space-y-3 pt-2 border-t border-[#748D92]/30">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider flex items-center justify-between">
                      <span>Graphics Team: Upload Creative</span>
                    </label>
                    <MediaUploader
                      value={creativeUrl}
                      mediaType={creativeType}
                      onChange={(url, type) => {
                        setCreativeUrl(url);
                        setCreativeType(type);
                      }}
                      allowedTypes="ALL"
                    />
                  </div>
                </div>
              )}

              {updateStatus === 'POSTED' && (
                <div className="space-y-3 pt-2 border-t border-[#748D92]/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                        Actual Posted Date
                      </label>
                      <input
                        type="date"
                        value={actualPostedDate}
                        onChange={(e) => setActualPostedDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                        Actual Posted Time
                      </label>
                      <input
                        type="time"
                        value={actualPostedTime}
                        onChange={(e) => setActualPostedTime(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {updateStatus === 'CANCELLED' && (
                <div className="space-y-3 pt-2 border-t border-[#748D92]/30">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                      Cancellation Reason
                    </label>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      rows={3}
                      placeholder="Please specify why this post/campaign was cancelled..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {updateStatus === 'DELAYED' && (
                <div className="space-y-3 pt-2 border-t border-[#748D92]/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                        New Date
                      </label>
                      <input
                        type="date"
                        value={delayedNewDate}
                        onChange={(e) => setDelayedNewDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                        New Target Time
                      </label>
                      <input
                        type="time"
                        value={delayedNewTargetTime}
                        onChange={(e) => setDelayedNewTargetTime(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                      Delay Reason
                    </label>
                    <textarea
                      value={delayReason}
                      onChange={(e) => setDelayReason(e.target.value)}
                      rows={3}
                      placeholder="Explain why the post was postponed..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* FIX 3: Clean button text "Update Status" */}
              <div className="pt-4 flex justify-end space-x-2 border-t border-[#748D92]/30">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ENTRY DETAILS MODAL */}
      {isDetailModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212A31]/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg sit-card bg-white border border-[#748D92] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#748D92]/30 bg-[#D3D9D4]/50">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-[#124E66]" />
                <h3 className="text-sm font-extrabold text-[#212A31]">Calendar Entry Details</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-[#212A31]/60 hover:text-[#212A31] rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-[#212A31] leading-snug">
                    {selectedEntry.title}
                  </h2>
                  <p className="text-xs text-[#2E3944] font-medium">Created by {selectedEntry.createdBy}</p>
                </div>
                <div>{getStatusBadge(selectedEntry.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-[#D3D9D4]/50 border border-[#748D92]/40 text-xs">
                <div>
                  <span className="text-[#2E3944] font-bold block uppercase text-[10px]">
                    Target Date
                  </span>
                  <span className="font-extrabold text-[#212A31]">
                    {toLocalDateString(selectedEntry.date)}
                  </span>
                </div>
                <div>
                  <span className="text-[#2E3944] font-bold block uppercase text-[10px]">
                    Target Time
                  </span>
                  <span className="font-mono font-extrabold text-[#212A31]">
                    {selectedEntry.targetTime}
                  </span>
                </div>
              </div>

              {/* Caption Section (Visible to all) */}
              {selectedEntry.caption && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <span className="font-bold block uppercase text-[10px] text-blue-700">
                    Campaign Caption:
                  </span>
                  <p className="whitespace-pre-wrap font-medium">{selectedEntry.caption}</p>
                </div>
              )}

              {/* FIX 5: Media Visibility Permissions - ONLY Admins can view uploaded media */}
              {canManage ? (
                selectedEntry.status === 'POSTER_READY' && selectedEntry.creativeUrl && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#212A31] uppercase tracking-wider">
                      Completed Creative Preview (Admin Only)
                    </h4>
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-[#748D92] min-h-[180px] flex items-center justify-center">
                      {selectedEntry.creativeType === 'VIDEO' ? (
                        <video src={selectedEntry.creativeUrl} controls className="w-full max-h-[300px]" />
                      ) : (
                        <img src={selectedEntry.creativeUrl} alt="Poster Creative" className="w-full object-cover max-h-[300px]" />
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">Media Access Note:</span> Uploaded poster files are accessible only to Organization Admins.
                </div>
              )}

              {selectedEntry.status === 'POSTED' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 font-medium">
                  <p className="font-bold">Published Confirmation:</p>
                  <p>
                    Posted on:{' '}
                    {selectedEntry.actualPostedDate
                      ? toLocalDateString(selectedEntry.actualPostedDate)
                      : 'N/A'}
                  </p>
                  <p>Posted time: {selectedEntry.actualPostedTime || 'N/A'}</p>
                </div>
              )}

              {selectedEntry.status === 'CANCELLED' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 font-medium">
                  <p className="font-bold">Cancellation Details:</p>
                  <p>{selectedEntry.cancellationReason}</p>
                </div>
              )}

              {selectedEntry.status === 'DELAYED' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 font-medium">
                  <p className="font-bold">Postponed Schedule:</p>
                  <p>
                    New Date:{' '}
                    {selectedEntry.newDate
                      ? toLocalDateString(selectedEntry.newDate)
                      : 'N/A'}
                  </p>
                  <p>New Target Time: {selectedEntry.newTargetTime}</p>
                  <p>Delay Reason: {selectedEntry.delayReason}</p>
                </div>
              )}

              {/* FIX 2 & FIX 3: Clean button text "Update Status", calls openStatusModal which closes details modal */}
              {canManage && (
                <div className="pt-4 flex items-center justify-between border-t border-[#748D92]/30">
                  <button
                    onClick={() => handleDeleteEntry(selectedEntry.id, selectedEntry.title)}
                    className="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Entry
                  </button>

                  <button
                    onClick={() => openStatusModal(selectedEntry)}
                    className="px-4 py-2 rounded-xl btn-primary text-xs font-bold"
                  >
                    Update Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
