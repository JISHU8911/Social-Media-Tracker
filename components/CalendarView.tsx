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
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Info,
} from 'lucide-react';

export interface CalendarEntryData {
  id: string;
  organizationId: string;
  title: string;
  date: string; // ISO String
  targetTime: string;
  status: 'PLANNED' | 'POSTER_READY' | 'POSTED' | 'CANCELLED' | 'DELAYED';
  creativeUrl?: string | null;
  creativeType?: 'IMAGE' | 'VIDEO' | null;
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

export default function CalendarView({ userRole, canManage }: CalendarViewProps) {
  const [entries, setEntries] = useState<CalendarEntryData[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTargetTime, setNewTargetTime] = useState('12:00');
  const [newStatus, setNewStatus] = useState<string>('PLANNED');

  // Form states for Status Update Modal
  const [updateStatus, setUpdateStatus] = useState<string>('POSTER_READY');
  const [creativeUrl, setCreativeUrl] = useState<string>('');
  const [creativeType, setCreativeType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [actualPostedDate, setActualPostedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [actualPostedTime, setActualPostedTime] = useState('12:00');
  const [cancellationReason, setCancellationReason] = useState('');
  const [delayedNewDate, setDelayedNewDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [delayedNewTargetTime, setDelayedNewTargetTime] = useState('12:00');
  const [delayReason, setDelayReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError('Title is required');
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create entry');

      setIsCreateModalOpen(false);
      setNewTitle('');
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

  const openStatusModal = (entry: CalendarEntryData) => {
    setSelectedEntry(entry);
    setUpdateStatus(entry.status === 'PLANNED' ? 'POSTER_READY' : entry.status);
    setCreativeUrl(entry.creativeUrl || '');
    setCreativeType(entry.creativeType || 'IMAGE');
    setActualPostedDate(
      entry.actualPostedDate
        ? new Date(entry.actualPostedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setActualPostedTime(entry.actualPostedTime || '12:00');
    setCancellationReason(entry.cancellationReason || '');
    setDelayedNewDate(
      entry.newDate
        ? new Date(entry.newDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setDelayedNewTargetTime(entry.newTargetTime || '12:00');
    setDelayReason(entry.delayReason || '');
    setError(null);
    setIsStatusModalOpen(true);
  };

  // Color Coding helper per Section 23
  // POSTER_READY = Blue, POSTED = Green, DELAYED = Orange, CANCELLED = Red
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
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
            <Clock className="h-3 w-3 text-slate-500" />
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

  // Date Nav Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];
  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }
  // Next month padding to fill grid
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  // Week Days calculation (Weekly View)
  const startOfWeek = new Date(currentDate);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    weekDays.push(d);
  }

  const getEntriesForDate = (dateObj: Date) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    return filteredEntries.filter((e) => {
      const eDateStr = new Date(e.date).toISOString().split('T')[0];
      return eDateStr === dateStr;
    });
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Bar */}
      <div className="sit-card p-4 sm:p-6 shadow-lg border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 shadow-sm">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-slate-500">
              Content Calendar & Social Campaign Schedule
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={todayMonth}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Create Button (Admins only) */}
          {canManage && (
            <button
              onClick={() => {
                setError(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl btn-primary text-xs font-bold shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="sit-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title..."
              className="w-full pl-9 pr-3 py-2 rounded-xl sit-input text-xs font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl sit-input text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="POSTER_READY">Poster Ready (Blue)</option>
              <option value="POSTED">Posted (Green)</option>
              <option value="DELAYED">Delayed (Orange)</option>
              <option value="CANCELLED">Cancelled (Red)</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="text-slate-400 uppercase tracking-wider text-[10px]">Legend:</span>
          <span className="px-2 py-0.5 rounded bg-blue-500 text-white">POSTER_READY</span>
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">POSTED</span>
          <span className="px-2 py-0.5 rounded bg-amber-500 text-white">DELAYED</span>
          <span className="px-2 py-0.5 rounded bg-rose-600 text-white">CANCELLED</span>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="sit-card p-12 text-center text-slate-400 text-xs font-medium">
          Loading calendar entries...
        </div>
      ) : viewMode === 'month' ? (
        /* MONTHLY VIEW */
        <div className="sit-card overflow-hidden border-slate-200 shadow-xl">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 uppercase tracking-wider py-3">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 bg-slate-100">
            {calendarDays.map((dayItem, idx) => {
              const dayEntries = getEntriesForDate(dayItem.date);
              const isToday =
                new Date().toDateString() === dayItem.date.toDateString();

              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 flex flex-col justify-between transition-colors ${
                    dayItem.isCurrentMonth
                      ? isToday
                        ? 'bg-cyan-50/60'
                        : 'bg-white'
                      : 'bg-slate-50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'h-6 w-6 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-sm'
                          : dayItem.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>
                    {dayEntries.length > 0 && (
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                        {dayEntries.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 space-y-1.5 overflow-y-auto max-h-24">
                    {dayEntries.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedEntry(item);
                          setIsDetailModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xl ${getStatusBorderColor(
                          item.status
                        )} bg-white`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold leading-tight">
                          <span className="truncate text-slate-900 font-semibold">{item.title}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                          <span className="font-mono">{item.targetTime}</span>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        /* WEEKLY VIEW */
        <div className="sit-card overflow-hidden border-slate-200 shadow-xl">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
            {weekDays.map((d, i) => (
              <div key={i}>
                <div>{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div
                  className={`text-sm mt-0.5 ${
                    new Date().toDateString() === d.toDateString()
                      ? 'text-cyan-600 font-extrabold'
                      : 'text-slate-900 font-semibold'
                  }`}
                >
                  {d.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-slate-200 bg-white min-h-[400px]">
            {weekDays.map((d, i) => {
              const dayEntries = getEntriesForDate(d);
              return (
                <div key={i} className="p-2 space-y-2 bg-slate-50/30">
                  {dayEntries.length === 0 ? (
                    <div className="text-[11px] text-slate-400 text-center pt-8">No entries</div>
                  ) : (
                    dayEntries.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedEntry(item);
                          setIsDetailModalOpen(true);
                        }}
                        className={`p-2.5 rounded-xl border bg-white shadow-sm cursor-pointer hover:shadow-md transition-all ${getStatusBorderColor(
                          item.status
                        )} space-y-1.5`}
                      >
                        <span className="text-xs font-bold text-slate-900 block leading-snug line-clamp-2">
                          {item.title}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-mono font-medium">{item.targetTime}</span>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* AGENDA / LIST VIEW */
        <div className="sit-card overflow-hidden border-slate-200 shadow-xl">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <CalendarIcon className="h-8 w-8 text-slate-300 mx-auto" />
              <p>No calendar entries found matching filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredEntries.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors ${getStatusBorderColor(
                    item.status
                  )} bg-white`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {item.title}
                      </h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center space-x-1">
                        <CalendarIcon className="h-3.5 w-3.5 text-cyan-600" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-cyan-600" />
                        <span className="font-mono">{item.targetTime}</span>
                      </span>
                      <span>By {item.createdBy}</span>
                    </div>

                    {/* Additional fields info if present */}
                    {item.status === 'POSTER_READY' && item.creativeUrl && (
                      <div className="pt-1 flex items-center space-x-2 text-xs text-blue-600 font-medium">
                        {item.creativeType === 'VIDEO' ? (
                          <VideoIcon className="h-3.5 w-3.5" />
                        ) : (
                          <ImageIcon className="h-3.5 w-3.5" />
                        )}
                        <span>Poster Creative Ready ({item.creativeType})</span>
                      </div>
                    )}
                    {item.status === 'POSTED' && item.actualPostedDate && (
                      <p className="text-xs text-emerald-600 font-medium">
                        Posted on {new Date(item.actualPostedDate).toLocaleDateString()} at{' '}
                        {item.actualPostedTime}
                      </p>
                    )}
                    {item.status === 'CANCELLED' && item.cancellationReason && (
                      <p className="text-xs text-rose-600 font-medium">
                        Reason: {item.cancellationReason}
                      </p>
                    )}
                    {item.status === 'DELAYED' && item.newDate && (
                      <p className="text-xs text-amber-600 font-medium">
                        Postponed to {new Date(item.newDate).toLocaleDateString()} at{' '}
                        {item.newTargetTime} ({item.delayReason})
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedEntry(item);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => openStatusModal(item)}
                      className="px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold flex items-center space-x-1"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Update Status</span>
                    </button>

                    {canManage && (
                      <button
                        onClick={() => handleDeleteEntry(item.id, item.title)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE ENTRY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md sit-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Create Calendar Entry</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Title <span className="text-cyan-600">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Independence Day Special Poster Campaign"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Date <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Target Time <span className="text-cyan-600">*</span>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Initial Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                >
                  <option value="PLANNED">PLANNED</option>
                  <option value="POSTER_READY">POSTER_READY (Blue)</option>
                  <option value="POSTED">POSTED (Green)</option>
                  <option value="DELAYED">DELAYED (Orange)</option>
                  <option value="CANCELLED">CANCELLED (Red)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
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
                  className="px-4 py-2 text-xs font-bold btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL (Section 23 & Section 24 Workflow) */}
      {isStatusModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg sit-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Update Calendar Status</h3>
                <p className="text-xs text-slate-500">{selectedEntry.title}</p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpdateStatus('POSTER_READY')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 text-xs font-bold transition-all ${
                      updateStatus === 'POSTER_READY'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
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
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>CANCELLED</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC ADDITIONAL FIELDS PER STATUS (Section 23 & 24) */}
              {updateStatus === 'POSTER_READY' && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Upload Creative (Image or Video)</span>
                      <span className="text-blue-600 text-[11px] lowercase font-normal">
                        Supported: JPG, PNG, WEBP, MP4, MOV, WEBM
                      </span>
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
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
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

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-200">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg sit-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900">Calendar Entry Details</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {selectedEntry.title}
                  </h2>
                  <p className="text-xs text-slate-500">Created by {selectedEntry.createdBy}</p>
                </div>
                <div>{getStatusBadge(selectedEntry.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Target Date
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedEntry.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">
                    Target Time
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedEntry.targetTime}
                  </span>
                </div>
              </div>

              {/* Status Specific Details */}
              {selectedEntry.status === 'POSTER_READY' && selectedEntry.creativeUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Completed Creative Preview
                  </h4>
                  <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 min-h-[200px] flex items-center justify-center">
                    {selectedEntry.creativeType === 'VIDEO' ? (
                      <video src={selectedEntry.creativeUrl} controls className="w-full max-h-[300px]" />
                    ) : (
                      <img src={selectedEntry.creativeUrl} alt="Poster Creative" className="w-full object-cover max-h-[300px]" />
                    )}
                  </div>
                </div>
              )}

              {selectedEntry.status === 'POSTED' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1 font-medium">
                  <p className="font-bold">Published Confirmation:</p>
                  <p>
                    Posted on:{' '}
                    {selectedEntry.actualPostedDate
                      ? new Date(selectedEntry.actualPostedDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <p>Posted time: {selectedEntry.actualPostedTime || 'N/A'}</p>
                </div>
              )}

              {selectedEntry.status === 'CANCELLED' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 font-medium">
                  <p className="font-bold">Cancellation Details:</p>
                  <p>{selectedEntry.cancellationReason}</p>
                </div>
              )}

              {selectedEntry.status === 'DELAYED' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1 font-medium">
                  <p className="font-bold">Postponed Schedule:</p>
                  <p>
                    New Date:{' '}
                    {selectedEntry.newDate
                      ? new Date(selectedEntry.newDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <p>New Target Time: {selectedEntry.newTargetTime}</p>
                  <p>Delay Reason: {selectedEntry.delayReason}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  onClick={() => openStatusModal(selectedEntry)}
                  className="px-4 py-2 rounded-xl btn-primary text-xs font-bold"
                >
                  Update Status / Creative
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
