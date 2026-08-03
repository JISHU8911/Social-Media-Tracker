'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MediaUploader from '@/components/MediaUploader';
import {
  ArrowLeft,
  Share2,
  FileText,
  AlertCircle,
  Link as LinkIcon,
  Sparkles,
  AlignLeft,
} from 'lucide-react';

export default function CreateNewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [caption, setCaption] = useState('');

  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [xUrl, setXUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaChange = (url: string, type: 'IMAGE' | 'VIDEO') => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Post title is required');
      return;
    }

    if (
      !facebookUrl.trim() &&
      !instagramUrl.trim() &&
      !linkedinUrl.trim() &&
      !xUrl.trim()
    ) {
      setError('Please provide at least one social media link (Facebook, Instagram, LinkedIn, or X)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: mediaUrl,
          videoUrl: mediaUrl,
          mediaType,
          caption: caption.trim() || undefined,
          facebookUrl: facebookUrl.trim() || undefined,
          instagramUrl: instagramUrl.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined,
          xUrl: xUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      router.push(`/admin/posts/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D3D9D4] text-[#212A31] font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl btn-secondary text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#212A31] tracking-tight">
              Create New Campaign Post
            </h1>
            <p className="text-xs sm:text-sm text-[#2E3944] font-medium">
              Distribute social media content and assign tracking identifiers to your team.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-3 font-medium">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-5 shadow-soft">
            <h2 className="text-sm font-extrabold text-[#212A31] uppercase tracking-wider border-b border-[#748D92]/30 pb-3">
              1. Campaign Basics
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider">
                Post Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Product Launch Announcement & Brand Drive"
                className="w-full px-4 py-3 rounded-xl sit-input text-xs sm:text-sm font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider flex items-center justify-between">
                <span>Campaign Caption & Hashtags</span>
                <span className="text-[10px] text-[#2E3944] font-normal lowercase">Optional</span>
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Enter campaign post text, hashtags, and social copy..."
                className="w-full px-4 py-3 rounded-xl sit-input text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          {/* Section 2: Media Assets Upload */}
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-5 shadow-soft">
            <h2 className="text-sm font-extrabold text-[#212A31] uppercase tracking-wider border-b border-[#748D92]/30 pb-3 flex items-center justify-between">
              <span>2. Campaign Media Creative</span>
              <span className="text-xs font-normal text-[#2E3944] font-mono">Image or Video</span>
            </h2>

            <MediaUploader
              value={mediaUrl}
              mediaType={mediaType}
              onChange={handleMediaChange}
              allowedTypes="ALL"
            />
          </div>

          {/* Section 3: Social Platform URLs */}
          <div className="sit-card p-6 bg-white border border-[#748D92] rounded-2xl space-y-5 shadow-soft">
            <h2 className="text-sm font-extrabold text-[#212A31] uppercase tracking-wider border-b border-[#748D92]/30 pb-3">
              3. Social Media Target Links (At least 1 required)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-1.5">
                  Facebook Post URL
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-1.5">
                  Instagram Post URL
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  className="w-full px-4 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-1.5">
                  LinkedIn Post URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/posts/..."
                  className="w-full px-4 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212A31] uppercase tracking-wider mb-1.5">
                  X (Twitter) Post URL
                </label>
                <input
                  type="url"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="https://x.com/status/..."
                  className="w-full px-4 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl btn-primary text-xs font-bold shadow-md disabled:opacity-50"
            >
              {loading ? 'Creating Campaign...' : 'Publish Campaign Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
