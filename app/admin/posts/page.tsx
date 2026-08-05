'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WhatsAppModal from '@/components/WhatsAppModal';
import { PlusCircle, Search, FileText, CheckCircle, MessageSquare, Trash2, ExternalLink } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  imageUrl: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  trackingCode: string;
  createdAt: string;
  _count: { submissions: number };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostForWhatsApp, setSelectedPostForWhatsApp] = useState<PostItem | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All submitted interaction proof for this post will also be deleted.`))
      return;

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
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
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#244855] tracking-tight">
              Post Management
            </h1>
            <p className="text-xs sm:text-sm text-[#244855]/80 font-medium">
              Create and manage social media campaign tracking links and broadcast messages.
            </p>
          </div>

          <Link
            href="/admin/posts/new"
            className="btn-primary inline-flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create New Post</span>
          </Link>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#244855]/40" />
            <input
              type="text"
              placeholder="Search by post title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl sit-input text-xs font-medium"
            />
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="sit-card p-12 text-center text-xs font-semibold text-[#244855]">
            Loading campaign posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="sit-card p-12 text-center space-y-3">
            <FileText className="h-10 w-10 text-[#244855]/40 mx-auto" />
            <h3 className="text-sm font-bold text-[#244855]">No Posts Found</h3>
            <p className="text-xs text-[#244855]/80">Create a new campaign post to start tracking employee social interactions.</p>
            <Link href="/admin/posts/new" className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold">
              <PlusCircle className="h-4 w-4" /> Create Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl flex flex-col justify-between hover:border-[#244855]/40 transition-all shadow-soft"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/post/${post.trackingCode}`}
                      target="_blank"
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFA896]/20 text-[#244855] border border-[#244855]/10 hover:underline inline-flex items-center gap-1"
                      title="Open Public Tracking Link"
                    >
                      ID: {post.trackingCode} <ExternalLink className="w-3 h-3" />
                    </Link>
                    <span className="text-xs font-bold text-[#E64833] flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {post._count?.submissions || 0} Submissions
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#244855] line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[#244855]/60 font-mono">
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#244855]/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPostForWhatsApp(post)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold btn-primary flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Alert
                  </button>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold btn-secondary flex items-center gap-1"
                    >
                      Details <ExternalLink className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Campaign Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WhatsApp Modal */}
        {selectedPostForWhatsApp && (
          <WhatsAppModal
            post={selectedPostForWhatsApp}
            onClose={() => setSelectedPostForWhatsApp(null)}
          />
        )}
      </main>
    </div>
  );
}
