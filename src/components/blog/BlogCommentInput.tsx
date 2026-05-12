'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface BlogCommentInputProps {
  postSlug: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function BlogCommentInput({
  postSlug,
  parentId,
  onSuccess,
  onCancel,
  placeholder = 'Viết bình luận...',
}: BlogCommentInputProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bình luận');
      return;
    }

    if (content.length > 1000) {
      setError('Bình luận quá dài (tối đa 1000 ký tự)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/blog/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setContent('');
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Không thể đăng bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/1000
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Đang gửi...' : parentId ? 'Trả lời' : 'Bình luận'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
