import Link from 'next/link';
import { Eye, Heart, MessageCircle, Edit, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProfileBlogCardProps {
    post: {
        slug: string;
        title: string;
        coverImage?: string | null;
        status: string;
        publishedAt?: Date | null;
        createdAt: Date;
        updatedAt: Date;
        viewCount: number;
        likeCount: number;
        commentCount: number;
    };
    isOwner: boolean;
}

export function ProfileBlogCard({ post, isOwner }: ProfileBlogCardProps) {
    const displayDate = isOwner
        ? post.updatedAt
        : (post.publishedAt || post.createdAt);

    return (
        <div className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
            {/* Cover Image */}
            <div className="relative h-32 overflow-hidden bg-gradient-to-br from-pgreen/20 to-fgreen/20">
                {post.coverImage ? (
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <FileText size={48} className="text-pgreen/30" />
                    </div>
                )}

                {/* Status Badge - Owner only */}
                {isOwner && (
                    <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${post.status === 'PUBLISHED'
                                ? 'bg-green-500 text-white'
                                : post.status === 'DRAFT'
                                    ? 'bg-gray-500 text-white'
                                    : post.status === 'PENDING_REVIEW'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-blue-500 text-white'
                            }`}>
                            {post.status}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-pgreen transition min-h-[2.5rem]">
                    {post.title}
                </h3>

                {/* Date */}
                <div className="text-[10px] text-gray-400 font-bold uppercase">
                    {isOwner ? 'Cập nhật: ' : ''}{formatDate(displayDate)}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <Eye size={12} /> {post.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <Heart size={12} /> {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle size={12} /> {post.commentCount}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-pgreen to-fgreen text-white rounded-xl text-xs font-bold hover:shadow-lg transition text-center"
                    >
                        Xem
                    </Link>
                    {isOwner && (
                        <Link
                            href={`/blog/${post.slug}/edit`}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 transition flex items-center gap-1"
                        >
                            <Edit size={12} /> Sửa
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
