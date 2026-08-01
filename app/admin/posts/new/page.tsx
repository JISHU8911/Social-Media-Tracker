'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MediaUploader from '@/components/MediaUploader';
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowLeft,
  Check,
  AlertCircle,
  AlignLeft,
} from 'lucide-react';

export default function CreatePostPage() {
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

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/admin/login');
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Post Title is required.');
      return;
    }

    if (!mediaUrl) {
      setError(`Post ${mediaType === 'VIDEO' ? 'Video' : 'Image'} upload is required.`);
      return;
    }

    if (caption.length > 5000) {
      setError('Caption exceeds maximum character limit of 5000 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          imageUrl: mediaUrl.trim(),
          videoUrl: mediaType === 'VIDEO' ? mediaUrl.trim() : undefined,
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl btn-secondary text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create Social Media Post
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Publish a post to generate public employee tracking links and broadcast messages.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="sit-card p-6 sm:p-8 space-y-6 shadow-xl border-slate-200">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm flex items-center space-x-2 font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Post Title <span className="text-cyan-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Product Announcement & Executive Keynote"
              required
              className="w-full px-4 py-3 rounded-xl sit-input text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Media Upload (Image or Video) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Media Upload (Image or Video) <span className="text-cyan-600">*</span>
            </label>
            <MediaUploader
              value={mediaUrl}
              mediaType={mediaType}
              onChange={(url, type) => {
                setMediaUrl(url);
                setMediaType(type);
              }}
              allowedTypes="ALL"
            />
          </div>

          {/* Caption (Multiline Textarea directly below Media field) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <AlignLeft className="h-4 w-4 text-cyan-600" />
                <span>Post Caption</span>
                <span className="text-slate-400 font-normal text-[11px] uppercase tracking-normal">
                  (Optional)
                </span>
              </label>
              <span
                className={`text-[11px] font-mono font-medium ${
                  caption.length > 4800 ? 'text-amber-600 font-bold' : 'text-slate-400'
                }`}
              >
                {caption.length} / 5000
              </span>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={5000}
              rows={4}
              placeholder="Write a custom caption or copy message for social media posts (up to 5000 characters)..."
              className="w-full px-4 py-3 rounded-xl sit-input text-xs sm:text-sm font-medium resize-y"
            />
          </div>

          {/* Optional Social Links */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Optional Social Media Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                  <Facebook className="h-3.5 w-3.5 text-blue-600" />
                  <span>Facebook Post URL</span>
                </label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                  <Instagram className="h-3.5 w-3.5 text-pink-600" />
                  <span>Instagram Post URL</span>
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                  <Linkedin className="h-3.5 w-3.5 text-sky-600" />
                  <span>LinkedIn Post URL</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1.5">
                  <Twitter className="h-3.5 w-3.5 text-slate-700" />
                  <span>X (Twitter) Post URL</span>
                </label>
                <input
                  type="url"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  placeholder="https://x.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl sit-input text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl btn-primary text-xs sm:text-sm shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing Post...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Publish Post & Generate Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
