'use client';

import { useState } from 'react';
import { Copy, Check, X, MessageSquare, AlignLeft, Video, Image as ImageIcon } from 'lucide-react';

interface Post {
  title: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | string | null;
  caption?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  trackingCode: string;
  organizationName?: string | null;
}

interface WhatsAppModalProps {
  post: Post;
  isOpen?: boolean;
  onClose: () => void;
}

export default function WhatsAppModal({ post, isOpen = true, onClose }: WhatsAppModalProps) {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const trackingLink = `${baseUrl}/post/${post.trackingCode}`;

  const orgBrand = post.organizationName || 'ClubHQ';

  let formattedMessage = `📢 *${post.title}*\n\n`;

  if (post.caption && post.caption.trim()) {
    formattedMessage += `${post.caption.trim()}\n\n`;
  }

  formattedMessage += `━━━━━━━━━━━━━━━━━━\n\n`;

  if (post.facebookUrl && post.facebookUrl.trim()) {
    formattedMessage += `📘 Facebook\n${post.facebookUrl.trim()}\n\n`;
  }
  if (post.instagramUrl && post.instagramUrl.trim()) {
    formattedMessage += `📸 Instagram\n${post.instagramUrl.trim()}\n\n`;
  }
  if (post.linkedinUrl && post.linkedinUrl.trim()) {
    formattedMessage += `💼 LinkedIn\n${post.linkedinUrl.trim()}\n\n`;
  }
  if (post.xUrl && post.xUrl.trim()) {
    formattedMessage += `𝕏 X\n${post.xUrl.trim()}\n\n`;
  }

  formattedMessage += `━━━━━━━━━━━━━━━━━━\n\n📝 Submit your interaction here:\n\n${trackingLink}\n\n━━━━━━━━━━━━━━━━━━\n\nShared via ${orgBrand}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleCopyCaption = async () => {
    if (!post.caption) return;
    try {
      await navigator.clipboard.writeText(post.caption.trim());
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#244855]/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg sit-card bg-white border border-[#244855]/15 rounded-2xl shadow-2xl overflow-hidden text-[#244855]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#244855]/10 bg-[#244855] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#E64833] text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">WhatsApp Share Generator</h3>
              <p className="text-xs text-white/80 font-medium">{orgBrand}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 bg-[#FFF8F5]/60">
          <div className="flex items-center justify-between text-xs text-[#244855]">
            <span className="font-extrabold text-[#244855] line-clamp-1">{post.title}</span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white font-mono text-[11px] border border-[#244855]/15 text-[#244855]">
              {post.mediaType === 'VIDEO' ? (
                <>
                  <Video className="h-3 w-3 text-[#E64833]" />
                  <span>Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3 w-3 text-[#244855]" />
                  <span>Image</span>
                </>
              )}
            </span>
          </div>

          <div className="relative">
            <pre className="w-full p-4 rounded-xl bg-[#244855] text-xs sm:text-sm text-white font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80 select-all border border-[#244855]">
              {formattedMessage}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 px-6 py-4 border-t border-[#244855]/10 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold btn-outline"
          >
            Close
          </button>

          {post.caption && post.caption.trim() && (
            <button
              onClick={handleCopyCaption}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                copiedCaption
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'btn-outline'
              }`}
            >
              {copiedCaption ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Caption Copied!</span>
                </>
              ) : (
                <>
                  <AlignLeft className="h-3.5 w-3.5" />
                  <span>Copy Caption</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopyMessage}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all btn-primary shadow-sm"
          >
            {copiedMessage ? (
              <>
                <Check className="h-4 w-4" />
                <span>Message Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy WhatsApp Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
