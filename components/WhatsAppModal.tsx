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

  const isVideo = post.mediaType === 'VIDEO' || Boolean(post.videoUrl);

  let formattedMessage = `---------------------------------\n\n[Media Attached: ${isVideo ? 'Video' : 'Image'}]\n\n`;

  if (post.title) {
    formattedMessage += `Title: ${post.title}\n\n`;
  }

  if (post.caption && post.caption.trim()) {
    formattedMessage += `Caption:\n${post.caption.trim()}\n\n`;
  }

  if (post.facebookUrl) formattedMessage += `Facebook:\n${post.facebookUrl}\n\n`;
  if (post.instagramUrl) formattedMessage += `Instagram:\n${post.instagramUrl}\n\n`;
  if (post.linkedinUrl) formattedMessage += `LinkedIn:\n${post.linkedinUrl}\n\n`;
  if (post.xUrl) formattedMessage += `X:\n${post.xUrl}\n\n`;

  formattedMessage += `Interaction Tracking:\n${trackingLink}\n\n---------------------------------`;

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
      await navigator.clipboard.writeText(post.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#212A31]/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg sit-card bg-white border border-[#748D92] rounded-2xl shadow-2xl overflow-hidden text-[#212A31]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#748D92]/30 bg-[#D3D9D4]/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#124E66] text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#212A31]">WhatsApp Share Generator</h3>
              <p className="text-xs text-[#2E3944] font-medium">ClubHQ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#212A31]/60 hover:text-[#212A31] rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#2E3944]">
            <span className="font-extrabold text-[#212A31] line-clamp-1">{post.title}</span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-[#D3D9D4] font-mono text-[11px] border border-[#748D92] text-[#212A31]">
              {isVideo ? (
                <>
                  <Video className="h-3 w-3 text-[#124E66]" />
                  <span>Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3 w-3 text-[#212A31]" />
                  <span>Image</span>
                </>
              )}
            </span>
          </div>

          <div className="relative">
            <pre className="w-full p-4 rounded-xl bg-[#212A31] text-xs sm:text-sm text-white font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80 select-all border border-[#212A31]">
              {formattedMessage}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 px-6 py-4 border-t border-[#748D92]/30 bg-[#D3D9D4]/30">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold btn-secondary"
          >
            Close
          </button>

          {post.caption && post.caption.trim() && (
            <button
              onClick={handleCopyCaption}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                copiedCaption
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-white text-[#212A31] hover:bg-[#D3D9D4] border-[#748D92]'
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
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all btn-primary shadow-sm`}
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
