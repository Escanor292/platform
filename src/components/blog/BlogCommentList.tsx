'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageCircle, Trash2, Reply } from 'lucide-react';
import { BlogCommentResponse } from '@/types/blog.types';
import { BlogCommentInput } from './BlogCommentInput';

interface BlogCommentListProps {
  comments: BlogCommentResponse[];
  postSlug: string;
  currentUserId?: string;
  onCommentAdded: () => void;
}

export function BlogCommentList({
  comments,
  postSlug,
  currentUserId,
  onCommentAdded,
}: BlogCommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postSlug={postSlug}
          currentUserId={currentUserId}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: BlogCommentResponse;
  postSlug: string;
  currentUserId?: string;
  onCommentAdded: () => void;
  isReply?: boolean;
}

function CommentItem({
  comment,
  postSlug,
  currentUserId,
  onCommentAdded,
  isReply = false,
}: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/blog/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }

      onCommentAdded(); // Refresh comments
    } catch (error) {
      alert('Không thể xóa bình luận');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyInput(false);
    onCommentAdded();
  };

  const canDelete = currentUserId === comment.userId;

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user.avatar ? (
            <Image
              src={comment.user.avatar}
              alt={comment.user.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900">{comment.user.name}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            {currentUserId && !isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
              >
                <Reply className="w-4 h-4" />
                Trả lời
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && currentUserId && (
            <div className="mt-3">
              <BlogCommentInput
                postSlug={postSlug}
                parentId={comment.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyInput(false)}
                placeholder="Viết câu trả lời..."
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postSlug={postSlug}
                  currentUserId={currentUserId}
                  onCommentAdded={onCommentAdded}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
