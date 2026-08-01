'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import WhatsAppModal from '@/components/WhatsAppModal';
import {
  FileText,
  PlusCircle,
  MessageSquare,
  ArrowRight,
  Trash2,
  Search,
  CheckCircle,
  Video as VideoIcon,
} from 'lucide-react';

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPostForWhatsApp, setSelectedPostForWhatsApp] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) router.push('/admin/login');
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUserRole(data.user.role);
      })
      .catch(() => router.push('/admin/login'));

    loadPosts();
  }, [router]);

  const loadPosts = () => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete post "${title}"? All associated submissions will also be deleted.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete post');
      }
      loadPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Post Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Create and manage social media campaign tracking links and broadcast messages.
            </p>
          </div>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl btn-primary text-xs sm:text-sm shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Post</span>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl sit-input text-xs font-medium"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="sit-card p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="h-8 w-8 text-slate-300 mx-auto" />
            <p>No social media posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="sit-card overflow-hidden flex flex-col justify-between sit-card-hover group"
              >
                <div className="space-y-4">
                  {/* Image banner */}
                  <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                    {post.mediaType === 'VIDEO' || post.videoUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <video
                          src={post.videoUrl || post.imageUrl}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                          <span className="p-3 rounded-full bg-white/90 text-purple-700 shadow-lg">
                            <VideoIcon className="h-6 w-6" />
                          </span>
                        </div>
                      </div>
                    ) : post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No Media
                      </div>
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-[11px] font-bold text-cyan-700 shadow-sm">
                      {post._count.submissions} Submissions
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-cyan-600 font-mono font-medium">
                      /post/{post.trackingCode}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <span>Created by {post.createdBy}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPostForWhatsApp(post)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {userRole === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedPostForWhatsApp && (
        <WhatsAppModal
          post={selectedPostForWhatsApp}
          isOpen={Boolean(selectedPostForWhatsApp)}
          onClose={() => setSelectedPostForWhatsApp(null)}
        />
      )}
    </div>
  );
}
