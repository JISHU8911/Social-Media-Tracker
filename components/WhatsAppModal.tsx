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
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppModal({ post, isOpen, onClose }: WhatsAppModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg sit-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Share Generator</h3>
              <p className="text-xs text-slate-500">Social Interaction Tracker (SIT)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{post.title}</span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
              {isVideo ? (
                <>
                  <Video className="h-3 w-3 text-purple-600" />
                  <span>Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3 w-3 text-cyan-600" />
                  <span>Image</span>
                </>
              )}
            </span>
          </div>

          <div className="relative">
            <pre className="w-full p-4 rounded-xl bg-slate-900 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80 select-all border border-slate-800">
              {formattedMessage}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 bg-slate-50">
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
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'bg-white text-purple-700 hover:bg-purple-50 border-purple-200'
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
            className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              copiedMessage
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
            }`}
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
