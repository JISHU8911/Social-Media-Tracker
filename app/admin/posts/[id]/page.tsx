'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WhatsAppModal from '@/components/WhatsAppModal';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  MessageSquare,
  Download,
  Search,
  Filter,
  Calendar,
  Edit,
  Trash2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ExternalLink,
  X as CloseIcon,
  Check,
  AlignLeft,
} from 'lucide-react';

interface SubmissionItem {
  id: string;
  fullName: string;
  designationId: string;
  designation: { id: string; designationName: string };
  facebookActions: string | null;
  instagramActions: string | null;
  linkedinActions: string | null;
  xActions: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PostDetails {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: string | null;
  caption?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  trackingCode: string;
  createdBy: string;
  createdAt: string;
  submissions: SubmissionItem[];
}

export default function PostDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<PostDetails | null>(null);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchName, setSearchName] = useState('');
  const [selectedDesignationFilter, setSelectedDesignationFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // WhatsApp modal state
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);

  // Edit Submission Modal state
  const [editingSubmission, setEditingSubmission] = useState<SubmissionItem | null>(null);
  const [editFb, setEditFb] = useState<string[]>([]);
  const [editIg, setEditIg] = useState<string[]>([]);
  const [editLi, setEditLi] = useState<string[]>([]);
  const [editX, setEditX] = useState<string[]>([]);
  const [updatingSubmission, setUpdatingSubmission] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/admin/login');
      })
      .catch(() => router.push('/admin/login'));

    fetchDesignations();
    loadPost();
  }, [params.id, router]);

  const loadPost = () => {
    fetch(`/api/posts/${params.id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchDesignations = () => {
    fetch('/api/designations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDesignations(data);
      });
  };

  const handleOpenEditSubmission = (sub: SubmissionItem) => {
    setEditingSubmission(sub);
    setEditFb(sub.facebookActions ? JSON.parse(sub.facebookActions) : []);
    setEditIg(sub.instagramActions ? JSON.parse(sub.instagramActions) : []);
    setEditLi(sub.linkedinActions ? JSON.parse(sub.linkedinActions) : []);
    setEditX(sub.xActions ? JSON.parse(sub.xActions) : []);
  };

  const handleSaveEditedSubmission = async () => {
    if (!editingSubmission) return;
    setUpdatingSubmission(true);

    try {
      const res = await fetch(`/api/submissions/${editingSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebookActions: editFb,
          instagramActions: editIg,
          linkedinActions: editLi,
          xActions: editX,
        }),
      });

      if (!res.ok) throw new Error('Failed to update submission');
      setEditingSubmission(null);
      loadPost();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingSubmission(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee submission?')) return;

    try {
      const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete submission');
      loadPost();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filter Submissions logic
  const filteredSubmissions = (post?.submissions || []).filter((sub) => {
    const matchesName = sub.fullName
      .toLowerCase()
      .includes(searchName.toLowerCase());

    const matchesDesignation = selectedDesignationFilter
      ? sub.designationId === selectedDesignationFilter
      : true;

    const matchesDate = selectedDateFilter
      ? sub.createdAt.startsWith(selectedDateFilter)
      : true;

    return matchesName && matchesDesignation && matchesDate;
  });

  // Excel Export Handler (.xlsx)
  const handleExportExcel = () => {
    if (!post) return;

    const exportRows = filteredSubmissions.map((sub) => {
      const fbArr: string[] = sub.facebookActions ? JSON.parse(sub.facebookActions) : [];
      const igArr: string[] = sub.instagramActions ? JSON.parse(sub.instagramActions) : [];
      const liArr: string[] = sub.linkedinActions ? JSON.parse(sub.linkedinActions) : [];
      const xArr: string[] = sub.xActions ? JSON.parse(sub.xActions) : [];

      return {
        'Employee Name': sub.fullName,
        'Designation': sub.designation?.designationName || '-',
        'Facebook Actions': fbArr.length > 0 ? fbArr.join(', ') : '-',
        'Instagram Actions': igArr.length > 0 ? igArr.join(', ') : '-',
        'LinkedIn Actions': liArr.length > 0 ? liArr.join(', ') : '-',
        'X (Twitter) Actions': xArr.length > 0 ? xArr.join(', ') : '-',
        'Submitted At': new Date(sub.createdAt).toLocaleString(),
        'Last Updated': new Date(sub.updatedAt).toLocaleString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Submissions');

    const cleanTitle = post.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    XLSX.writeFile(workbook, `SIT_Submissions_${cleanTitle}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center font-sans">
        <div className="text-xs font-bold text-[#2E3944]">Loading post details...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] flex items-center justify-center p-4 font-sans">
        <div className="sit-card p-8 text-center space-y-3 bg-white border border-[#748D92] rounded-2xl shadow-soft">
          <p className="text-sm font-bold text-[#212A31]">Post not found.</p>
          <button
            onClick={() => router.push('/admin')}
            className="btn-primary px-4 py-2 text-xs font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2.5 rounded-xl btn-secondary text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#212A31] line-clamp-1">
                {post.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold mt-1">
                <span className="text-[#2E3944]">Tracking Link:</span>
                <Link
                  href={`/post/${post.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#124E66] hover:underline hover:text-[#0E3E52] inline-flex items-center gap-1 bg-[#D3D9D4]/60 px-2 py-0.5 rounded border border-[#748D92]/40 transition-colors"
                  title="Open Public Tracking Page"
                >
                  /post/{post.trackingCode} <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setWhatsAppModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Broadcast</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl btn-primary text-xs sm:text-sm shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Post Card & Social Media Links */}
        <div className="sit-card p-6 border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
          <div className="h-56 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
            {post.mediaType === 'VIDEO' ? (
              <video
                src={post.videoUrl || post.imageUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : post.mediaType === 'IMAGE' ? (
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            ) : ['.mp4', '.webm', '.mov'].some(ext => (post.videoUrl || post.imageUrl || '').toLowerCase().includes(ext)) ? (
              <video
                src={post.videoUrl || post.imageUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : post.imageUrl ? (
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No Media
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">{post.title}</h2>
              
              {/* Optional Post Caption Display */}
              {post.caption && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <AlignLeft className="h-3 w-3 text-cyan-600" />
                    <span>Post Caption</span>
                  </span>
                  <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              )}

              <div className="text-xs text-slate-500 space-x-4 font-medium">
                <span>Created By: <strong className="text-slate-800">{post.createdBy}</strong></span>
                <span>Date: <strong className="text-slate-800">{new Date(post.createdAt).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Social Media Links:
              </span>
              <div className="flex flex-wrap gap-2">
                {post.facebookUrl && (
                  <a
                    href={post.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:underline border border-blue-100"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    <span>Facebook</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {post.instagramUrl && (
                  <a
                    href={post.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-semibold hover:underline border border-pink-100"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    <span>Instagram</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {post.linkedinUrl && (
                  <a
                    href={post.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold hover:underline border border-sky-100"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {post.xUrl && (
                  <a
                    href={post.xUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:underline border border-slate-200"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    <span>X</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Section Header & Filters */}
        <div className="sit-card p-6 border-slate-200 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Employee Submissions</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                  {filteredSubmissions.length} Total
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Detailed platform engagement actions per employee.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Name */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search name..."
                  className="pl-9 pr-3 py-2 rounded-xl sit-input text-xs font-medium w-40 sm:w-48"
                />
              </div>

              {/* Filter Designation */}
              <div className="relative">
                <select
                  value={selectedDesignationFilter}
                  onChange={(e) => setSelectedDesignationFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 rounded-xl sit-input text-xs font-medium bg-white text-slate-900"
                >
                  <option value="">All Designations</option>
                  {designations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.designationName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Date */}
              <div className="relative">
                <input
                  type="date"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl sit-input text-xs font-medium bg-white text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          {filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-medium">
              No submissions match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Facebook</th>
                    <th className="py-3.5 px-4">Instagram</th>
                    <th className="py-3.5 px-4">LinkedIn</th>
                    <th className="py-3.5 px-4">X</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredSubmissions.map((sub) => {
                    const fb: string[] = sub.facebookActions
                      ? JSON.parse(sub.facebookActions)
                      : [];
                    const ig: string[] = sub.instagramActions
                      ? JSON.parse(sub.instagramActions)
                      : [];
                    const li: string[] = sub.linkedinActions
                      ? JSON.parse(sub.linkedinActions)
                      : [];
                    const x: string[] = sub.xActions ? JSON.parse(sub.xActions) : [];

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 uppercase">
                          {sub.fullName}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-cyan-700 font-mono">
                          {sub.designation?.designationName || '-'}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {fb.length > 0 ? (
                            <span className="text-blue-700 font-semibold">{fb.join(', ')}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {ig.length > 0 ? (
                            <span className="text-pink-700 font-semibold">{ig.join(', ')}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {li.length > 0 ? (
                            <span className="text-sky-700 font-semibold">{li.join(', ')}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {x.length > 0 ? (
                            <span className="text-slate-800 font-semibold">{x.join(', ')}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(sub.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleOpenEditSubmission(sub)}
                            className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Edit Submission"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Submission"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* WhatsApp Modal */}
      {whatsAppModalOpen && (
        <WhatsAppModal
          post={post}
          isOpen={whatsAppModalOpen}
          onClose={() => setWhatsAppModalOpen(false)}
        />
      )}

      {/* Edit Submission Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg sit-card shadow-2xl overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Submission: {editingSubmission.fullName}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {editingSubmission.designation?.designationName}
                </p>
              </div>
              <button
                onClick={() => setEditingSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Platform actions editing checkboxes */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-blue-700">Facebook Actions:</span>
                <div className="flex flex-wrap gap-2">
                  {['Like', 'Comment', 'Share', 'Story'].map((opt) => (
                    <label key={opt} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFb.includes(opt)}
                        onChange={(e) =>
                          setEditFb(
                            e.target.checked
                              ? [...editFb, opt]
                              : editFb.filter((o) => o !== opt)
                          )
                        }
                        className="rounded border-slate-300 text-cyan-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-pink-700">Instagram Actions:</span>
                <div className="flex flex-wrap gap-2">
                  {['Like', 'Comment', 'Share', 'Story', 'Repost'].map((opt) => (
                    <label key={opt} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editIg.includes(opt)}
                        onChange={(e) =>
                          setEditIg(
                            e.target.checked
                              ? [...editIg, opt]
                              : editIg.filter((o) => o !== opt)
                          )
                        }
                        className="rounded border-slate-300 text-cyan-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-sky-700">LinkedIn Actions:</span>
                <div className="flex flex-wrap gap-2">
                  {['Like', 'Comment', 'Repost', 'Share'].map((opt) => (
                    <label key={opt} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editLi.includes(opt)}
                        onChange={(e) =>
                          setEditLi(
                            e.target.checked
                              ? [...editLi, opt]
                              : editLi.filter((o) => o !== opt)
                          )
                        }
                        className="rounded border-slate-300 text-cyan-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800">X (Twitter) Actions:</span>
                <div className="flex flex-wrap gap-2">
                  {['Like', 'Reply', 'Repost', 'Quote Post'].map((opt) => (
                    <label key={opt} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editX.includes(opt)}
                        onChange={(e) =>
                          setEditX(
                            e.target.checked
                              ? [...editX, opt]
                              : editX.filter((o) => o !== opt)
                          )
                        }
                        className="rounded border-slate-300 text-cyan-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setEditingSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedSubmission}
                disabled={updatingSubmission}
                className="px-4 py-2 rounded-xl text-xs font-bold btn-primary"
              >
                {updatingSubmission ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
