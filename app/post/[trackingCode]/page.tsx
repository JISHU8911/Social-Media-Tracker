'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Sparkles,
  AlignLeft,
} from 'lucide-react';
import DuplicateSubmissionModal from '@/components/DuplicateSubmissionModal';

interface PostData {
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
}

interface DesignationData {
  id: string;
  designationName: string;
}

const PLATFORM_INTERACTIONS = {
  Facebook: ['Like', 'Comment', 'Share', 'Story'],
  Instagram: ['Like', 'Comment', 'Share', 'Story', 'Repost'],
  LinkedIn: ['Like', 'Comment', 'Repost', 'Share'],
  X: ['Like', 'Reply', 'Repost', 'Quote Post'],
};

export default function EmployeeTrackingPage({
  params,
}: {
  params: { trackingCode: string };
}) {
  const [post, setPost] = useState<PostData | null>(null);
  const [designations, setDesignations] = useState<DesignationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [interactions, setInteractions] = useState<{
    Facebook: string[];
    Instagram: string[];
    LinkedIn: string[];
    X: string[];
  }>({
    Facebook: [],
    Instagram: [],
    LinkedIn: [],
    X: [],
  });

  // Validation & UI states
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Duplicate detection modal state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [existingSubmissionData, setExistingSubmissionData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/posts/by-code/${params.trackingCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Post not found or invalid link');
        return res.json();
      })
      .then((data) => setPost(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    fetch('/api/designations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDesignations(data);
      })
      .catch(() => {});
  }, [params.trackingCode]);

  // Name validation logic: uppercase auto-convert, min 2 words
  const handleNameChange = (val: string) => {
    let upper = val.toUpperCase();
    upper = upper.replace(/[^A-Z\s]/g, '');
    setFullName(upper);

    const trimmed = upper.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (trimmed.length > 0 && parts.length < 2) {
      setNameError('Please enter your full name in CAPITAL LETTERS (Minimum 2 words).');
    } else {
      setNameError(null);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
      setInteractions((prev) => ({ ...prev, [platform]: [] }));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleInteractionToggle = (platform: keyof typeof interactions, option: string) => {
    setInteractions((prev) => {
      const current = prev[platform] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [platform]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent, forceUpdateFlag = isEditingExisting) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      setNameError('Please enter your full name in CAPITAL LETTERS (Minimum 2 words).');
      return;
    }

    if (!designationId) {
      alert('Please select your designation.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one social media platform you interacted with.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        postId: post?.id,
        fullName: trimmedName,
        designationId,
        facebookActions: selectedPlatforms.includes('Facebook') ? interactions.Facebook : [],
        instagramActions: selectedPlatforms.includes('Instagram') ? interactions.Instagram : [],
        linkedinActions: selectedPlatforms.includes('LinkedIn') ? interactions.LinkedIn : [],
        xActions: selectedPlatforms.includes('X') ? interactions.X : [],
        forceUpdate: forceUpdateFlag,
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409 && data.duplicate) {
        setExistingSubmissionData(data.submission);
        setDuplicateModalOpen(true);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit engagement.');
      }

      setSubmitSuccess(true);
      setIsEditingExisting(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmissionFromModal = () => {
    setDuplicateModalOpen(false);
    setIsEditingExisting(true);

    if (existingSubmissionData) {
      const fb: string[] = existingSubmissionData.facebookActions
        ? JSON.parse(existingSubmissionData.facebookActions)
        : [];
      const ig: string[] = existingSubmissionData.instagramActions
        ? JSON.parse(existingSubmissionData.instagramActions)
        : [];
      const li: string[] = existingSubmissionData.linkedinActions
        ? JSON.parse(existingSubmissionData.linkedinActions)
        : [];
      const x: string[] = existingSubmissionData.xActions
        ? JSON.parse(existingSubmissionData.xActions)
        : [];

      const activePlats: string[] = [];
      if (fb.length > 0) activePlats.push('Facebook');
      if (ig.length > 0) activePlats.push('Instagram');
      if (li.length > 0) activePlats.push('LinkedIn');
      if (x.length > 0) activePlats.push('X');

      setSelectedPlatforms(activePlats.length > 0 ? activePlats : ['Facebook']);
      setInteractions({
        Facebook: fb,
        Instagram: ig,
        LinkedIn: li,
        X: x,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-xs font-semibold text-slate-500">Loading tracking link...</div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900">
        <div className="max-w-md w-full p-8 text-center sit-card">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Invalid Tracking Link</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const selectedDesignationName = designations.find((d) => d.id === designationId)?.designationName || '';

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <DuplicateSubmissionModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onEdit={handleEditSubmissionFromModal}
        employeeName={fullName}
        designationName={selectedDesignationName}
      />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-[#748D92] text-[#212A31] text-xs font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#124E66]" />
            <span>ClubHQ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
            Employee Engagement Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#2E3944] font-medium max-w-lg mx-auto">
            Review company social media post details below, interact on your platforms, and log your engagement actions.
          </p>
        </div>

        {/* Post Card */}
        {post && (
          <div className="sit-card overflow-hidden shadow-md border-slate-200">
            {/* Post Media (Image or Video) */}
            <div className="relative w-full min-h-[240px] sm:min-h-[320px] max-h-[450px] bg-slate-900 flex items-center justify-center overflow-hidden border-b border-slate-200">
              {post.mediaType === 'VIDEO' ? (
                <video
                  src={post.videoUrl || post.imageUrl}
                  controls
                  className="w-full max-h-[450px] object-contain"
                />
              ) : post.mediaType === 'IMAGE' ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : ['.mp4', '.webm', '.mov'].some(ext => (post.videoUrl || post.imageUrl || '').toLowerCase().includes(ext)) ? (
                <video
                  src={post.videoUrl || post.imageUrl}
                  controls
                  className="w-full max-h-[450px] object-contain"
                />
              ) : post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-xs">No Media Available</div>
              )}
            </div>

            {/* Post Details & Social Media Buttons */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {post.title}
              </h2>

              {/* Caption if present */}
              {post.caption && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <AlignLeft className="h-3.5 w-3.5 text-cyan-600" />
                    <span>Post Caption / Details</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Open Post on Platforms:
                </span>
                <div className="flex flex-wrap gap-3">
                  {post.facebookUrl && (
                    <a
                      href={post.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs sm:text-sm font-semibold transition-all"
                    >
                      <Facebook className="h-4 w-4" />
                      <span>Facebook</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                  {post.instagramUrl && (
                    <a
                      href={post.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs sm:text-sm font-semibold transition-all"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                  {post.linkedinUrl && (
                    <a
                      href={post.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs sm:text-sm font-semibold transition-all"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                  {post.xUrl && (
                    <a
                      href={post.xUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-semibold transition-all"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>X (Twitter)</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Success Banner */}
        {submitSuccess ? (
          <div className="sit-card p-8 text-center space-y-4 border-emerald-200 bg-emerald-50/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEditingExisting ? 'Submission Updated!' : 'Thank You! Submission Recorded.'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your engagement actions have been logged successfully for internal company tracking.
            </p>
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setIsEditingExisting(false);
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl btn-primary text-xs sm:text-sm font-bold shadow-md"
            >
              <span>Submit Another or Edit Response</span>
            </button>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={(e) => handleSubmit(e)} className="sit-card p-6 sm:p-8 space-y-6 shadow-md border-slate-200">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Employee Interaction Form</span>
                {isEditingExisting && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Editing Mode
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Please enter your full name, designation, and select all engagement actions completed.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name <span className="text-cyan-600">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. RAHUL SHARMA"
                className="w-full px-4 py-3 rounded-xl sit-input text-xs sm:text-sm font-bold uppercase tracking-wide placeholder:normal-case placeholder:font-normal"
                required
                disabled={isEditingExisting}
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Please enter your full name in CAPITAL LETTERS (Minimum 2 words). Auto-converts to UPPERCASE.
              </p>
              {nameError && (
                <p className="text-xs font-semibold text-amber-600 flex items-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            {/* Designation Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Designation <span className="text-cyan-600">*</span>
              </label>
              <select
                value={designationId}
                onChange={(e) => setDesignationId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl sit-input text-xs sm:text-sm font-medium bg-white text-slate-900"
                required
                disabled={isEditingExisting}
              >
                <option value="">-- Select Your Designation --</option>
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.designationName}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Selection (Multi-select) */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Platforms Interacted With <span className="text-cyan-600">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Facebook', 'Instagram', 'LinkedIn', 'X'].map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                        isSelected
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-400 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-cyan-600 h-4 w-4 pointer-events-none"
                      />
                      <span>{platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Interaction Sections */}
            {selectedPlatforms.map((platform) => {
              const options =
                PLATFORM_INTERACTIONS[platform as keyof typeof PLATFORM_INTERACTIONS] || [];
              const selectedActions =
                interactions[platform as keyof typeof interactions] || [];

              return (
                <div
                  key={platform}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {platform} Interactions
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {selectedActions.length} selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {options.map((option) => {
                      const isChecked = selectedActions.includes(option);
                      return (
                        <label
                          key={option}
                          className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-white text-cyan-800 border-cyan-500 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleInteractionToggle(
                                platform as keyof typeof interactions,
                                option
                              )
                            }
                            className="rounded border-slate-300 text-cyan-600 h-4 w-4"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl btn-primary font-bold text-xs sm:text-sm shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <span>Recording Submission...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>
                      {isEditingExisting ? 'Update Submission' : 'Submit Engagement'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
