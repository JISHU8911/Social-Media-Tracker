'use client';

import { useState } from 'react';
import { Copy, Check, X, MessageSquare } from 'lucide-react';

interface Post {
  title: string;
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
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const trackingLink = `${baseUrl}/post/${post.trackingCode}`;

  let formattedMessage = `📢 NEW SOCIAL MEDIA POST\n\n${post.title.toUpperCase()}\n\n`;

  if (post.facebookUrl) formattedMessage += `Facebook:\n${post.facebookUrl}\n\n`;
  if (post.instagramUrl) formattedMessage += `Instagram:\n${post.instagramUrl}\n\n`;
  if (post.linkedinUrl) formattedMessage += `LinkedIn:\n${post.linkedinUrl}\n\n`;
  if (post.xUrl) formattedMessage += `X:\n${post.xUrl}\n\n`;

  formattedMessage += `After interacting with the post, please submit your engagement details here:\n\n${trackingLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy message:', err);
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
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Broadcast Generator</h3>
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
          <div className="relative">
            <pre className="w-full p-4 rounded-xl bg-slate-900 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80 select-all border border-slate-800">
              {formattedMessage}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold btn-secondary"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Broadcast Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
