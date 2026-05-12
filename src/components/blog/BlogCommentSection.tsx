'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';
import { BlogCommentResponse } from '@/types/blog.types';
import { BlogCommentList } from './BlogCommentList';
import { BlogCommentInput } from './BlogCommentInput';

interface BlogCommentSectionProps {
  postSlug: string;
}

export function BlogCommentSection({ postSlug }: BlogCommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<BlogCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/posts/${postSlug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        Bình luận ({comments.length})
      </h2>

      {/* Comment Input */}
      {session?.user ? (
        <div className="mb-8">
          <BlogCommentInput
            postSlug={postSlug}
            onSuccess={fetchComments}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">
            <a href="/auth/signin" className="text-blue-600 hover:underline">
              Đăng nhập
            </a>{' '}
            để bình luận
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <BlogCommentList
          comments={comments}
          postSlug={postSlug}
          currentUserId={session?.user?.id}
          onCommentAdded={fetchComments}
        />
      )}
    </div>
  );
}
