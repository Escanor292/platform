"use client";

import { BookOpen, Eye, Heart, MessageCircle, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    publishedAt?: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
}

interface LinkedBlog {
    id: string;
    order: number;
    blogPost: BlogPost;
}

interface LinkedBlogsSectionProps {
    linkedBlogs: LinkedBlog[];
}

export default function LinkedBlogsSection({ linkedBlogs }: LinkedBlogsSectionProps) {
    if (!linkedBlogs || linkedBlogs.length === 0) {
        return (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-gray-200">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có bài viết blog
                </h3>
                <p className="text-sm text-gray-600">
                    Chủ dự án chưa gắn bài viết blog nào vào dự án này
                </p>
            </div>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    Bài viết liên quan
                </h2>
                <span className="text-sm text-gray-500">
                    {linkedBlogs.length} bài viết
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {linkedBlogs.map(({ blogPost }) => (
                    <Link
                        key={blogPost.id}
                        href={`/blog/${blogPost.slug}`}
                        className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row gap-4 p-4">
                            {/* Cover Image */}
                            {blogPost.coverImage && (
                                <div className="relative w-full sm:w-48 h-48 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                    <Image
                                        src={blogPost.coverImage}
                                        alt={blogPost.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                        {blogPost.title}
                                    </h3>

                                    {blogPost.excerpt && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                            {blogPost.excerpt}
                                        </p>
                                    )}
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                    {blogPost.publishedAt && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{formatDate(blogPost.publishedAt)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>{blogPost.viewCount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Heart className="h-3.5 w-3.5" />
                                        <span>{blogPost.likeCount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        <span>{blogPost.commentCount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
