'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Sparkles, Calendar, ExternalLink, RefreshCw, Video, Image as ImageIcon } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: string;
  caption?: string;
  trackingCode: string;
  createdAt: string;
}

export default function PublishedPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          if (!data.user.organizationId && data.user.role !== 'PLATFORM_SUPER_ADMIN' && data.user.role !== 'SUPER_ADMIN') {
            alert('Join an organization to access organization resources.');
            router.push('/join-organization');
          } else {
            fetchPublishedPosts();
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchPublishedPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error('Failed to load published posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#244855] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#244855] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#E64833]" /> Published Campaign Posts
            </h1>
            <p className="text-xs text-[#244855]/80 font-medium mt-1">
              Browse organization social media campaigns and log your interaction verification details.
            </p>
          </div>
          <button
            onClick={fetchPublishedPosts}
            className="btn-secondary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="sit-card p-12 text-center text-xs font-semibold text-[#244855]">
            Loading campaign posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="sit-card p-12 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#244855]">No Published Campaign Posts</h3>
            <p className="text-xs text-[#244855]/80">Your organization administrators have not published any posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const isVideo = post.mediaType === 'VIDEO';
              return (
                <div
                  key={post.id}
                  className="sit-card p-6 bg-white border border-[#244855]/15 rounded-2xl space-y-4 shadow-soft flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFA896]/20 text-[#244855] border border-[#244855]/10">
                        ID: {post.trackingCode}
                      </span>
                      <span className="text-[11px] font-mono text-[#244855]/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-[#244855] line-clamp-2">
                      {post.title}
                    </h3>

                    {post.caption && (
                      <p className="text-xs text-[#244855]/80 line-clamp-3 bg-[#FFA896]/10 p-3 rounded-xl border border-[#244855]/10 italic">
                        &quot;{post.caption}&quot;
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#244855]/10 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-[#E64833] inline-flex items-center gap-1">
                      {isVideo ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      {isVideo ? 'Video' : 'Image'}
                    </span>

                    <Link
                      href={`/post/${post.trackingCode}`}
                      className="btn-primary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      Log Interaction <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
