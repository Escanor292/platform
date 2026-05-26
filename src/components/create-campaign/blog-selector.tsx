"use client";

import { useState, useEffect } from "react";
import { BookOpen, Search, X, Plus, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    publishedAt?: string;
    status: string;
}

interface BlogSelectorProps {
    selectedBlogIds: string[];
    onBlogsChange: (blogIds: string[]) => void;
}

export function BlogSelector({ selectedBlogIds, onBlogsChange }: BlogSelectorProps) {
    const [availableBlogs, setAvailableBlogs] = useState<BlogPost[]>([]);
    const [selectedBlogs, setSelectedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSelector, setShowSelector] = useState(false);

    useEffect(() => {
        loadUserBlogs();
    }, []);

    useEffect(() => {
        // Update selected blogs when selectedBlogIds changes
        if (availableBlogs.length > 0) {
            const selected = availableBlogs.filter(blog => selectedBlogIds.includes(blog.id));
            setSelectedBlogs(selected);
        }
    }, [selectedBlogIds, availableBlogs]);

    const loadUserBlogs = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/blog/my-posts?status=PUBLISHED");
            if (!response.ok) throw new Error("Failed to load blogs");

            const data = await response.json();
            setAvailableBlogs(data.posts || []);
        } catch (error) {
            console.error("Error loading blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBlog = (blog: BlogPost) => {
        if (!selectedBlogIds.includes(blog.id)) {
            const newSelectedIds = [...selectedBlogIds, blog.id];
            onBlogsChange(newSelectedIds);
            setShowSelector(false);
            setSearchQuery("");
        }
    };

    const handleRemoveBlog = (blogId: string) => {
        const newSelectedIds = selectedBlogIds.filter(id => id !== blogId);
        onBlogsChange(newSelectedIds);
    };

    const handleReorder = (fromIndex: number, toIndex: number) => {
        const newSelected = [...selectedBlogs];
        const [movedItem] = newSelected.splice(fromIndex, 1);
        newSelected.splice(toIndex, 0, movedItem);

        const newSelectedIds = newSelected.map(blog => blog.id);
        onBlogsChange(newSelectedIds);
    };

    const filteredBlogs = availableBlogs.filter(blog =>
        !selectedBlogIds.includes(blog.id) &&
        (blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <label className="text-sm font-bold text-gray-900">
                        Bài viết blog liên quan
                    </label>
                </div>
                <span className="text-xs text-gray-500">
                    {selectedBlogs.length} bài viết đã chọn
                </span>
            </div>

            <p className="text-sm text-gray-600">
                Gắn các bài blog của bạn vào dự án để người ủng hộ có thể tìm hiểu thêm về câu chuyện, tiến độ và thông tin chi tiết.
            </p>

            {/* Selected Blogs */}
            {selectedBlogs.length > 0 && (
                <div className="space-y-2">
                    {selectedBlogs.map((blog, index) => (
                        <div
                            key={blog.id}
                            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl group hover:bg-blue-100 transition-colors"
                        >
                            <button
                                type="button"
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                title="Kéo để sắp xếp"
                            >
                                <GripVertical className="h-5 w-5" />
                            </button>

                            {blog.coverImage && (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={blog.coverImage}
                                        alt={blog.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {blog.title}
                                </h4>
                                {blog.excerpt && (
                                    <p className="text-xs text-gray-600 truncate mt-0.5">
                                        {blog.excerpt}
                                    </p>
                                )}
                                {blog.publishedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(blog.publishedAt)}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleRemoveBlog(blog.id)}
                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Xóa"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Blog Button */}
            {!showSelector && (
                <button
                    type="button"
                    onClick={() => setShowSelector(true)}
                    className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Thêm bài viết blog
                </button>
            )}

            {/* Blog Selector Modal */}
            {showSelector && (
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Chọn bài viết</h4>
                        <button
                            type="button"
                            onClick={() => {
                                setShowSelector(false);
                                setSearchQuery("");
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                                Đang tải...
                            </div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">
                                    {searchQuery ? "Không tìm thấy bài viết" : "Bạn chưa có bài viết nào được xuất bản"}
                                </p>
                            </div>
                        ) : (
                            filteredBlogs.map((blog) => (
                                <button
                                    key={blog.id}
                                    type="button"
                                    onClick={() => handleAddBlog(blog)}
                                    className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                                >
                                    {blog.coverImage && (
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-sm text-gray-900 truncate">
                                            {blog.title}
                                        </h5>
                                        {blog.excerpt && (
                                            <p className="text-xs text-gray-600 truncate mt-0.5">
                                                {blog.excerpt}
                                            </p>
                                        )}
                                        {blog.publishedAt && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(blog.publishedAt)}
                                            </p>
                                        )}
                                    </div>

                                    <Plus className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {availableBlogs.length === 0 && !loading && (
                <div className="text-center py-6 px-4 bg-gray-50 rounded-xl border border-gray-200">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-2">
                        Bạn chưa có bài viết blog nào được xuất bản
                    </p>
                    <a
                        href="/blog/create"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Tạo bài viết đầu tiên →
                    </a>
                </div>
            )}
        </div>
    );
}
