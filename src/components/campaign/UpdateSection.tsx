"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { PlusCircle, Sparkles, Send, Search, Tag, Pin, Edit2, Trash2, X } from "lucide-react";
import { formatFullDateTime } from "@/lib/utils";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";
import RichTextRenderer from "@/components/shared/RichTextRenderer";

interface UpdateSectionProps {
  campaignId: string;
  slug: string;
  isCreator: boolean;
}

// Danh sách tags với màu sắc riêng
const TAG_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  "Tiến độ": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  "Sản xuất": { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  "Thử nghiệm": { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  "Vận chuyển": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  "Đóng gói": { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  "Thiết kế": { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  "Nguyên liệu": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  "Chất lượng": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  "Cải tiến": { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200" },
  "Hoàn thành": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  "Khó khăn": { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  "Thành công": { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-200" },
  "Cảm ơn": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  "Thông báo": { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" }
};

const AVAILABLE_TAGS = Object.keys(TAG_CONFIG);

const getTagStyle = (tag: string) => {
  return TAG_CONFIG[tag] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
};

export default function UpdateSection({ campaignId, slug, isCreator }: UpdateSectionProps) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLDivElement>(null); // Ref cho form
  const [updates, setUpdates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ID của update đang edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>(""); // Chỉ 1 tag
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchUpdates();
  }, [slug, searchQuery, filterTag]);

  const fetchUpdates = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterTag) params.append("tag", filterTag);

      const res = await fetch(`/api/campaigns/${slug}/updates?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpdates(data);

      // Extract all unique tags
      const uniqueTags = Array.from(new Set(data.flatMap((u: any) => u.tags || []))) as string[];
      setAllTags(uniqueTags);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      const url = editingId
        ? `/api/campaigns/${slug}/updates/${editingId}`
        : `/api/campaigns/${slug}/updates`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
          tags: selectedTag ? [selectedTag] : [], // Chỉ 1 tag
          isPinned,
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (editingId) {
          // Cập nhật update trong list
          setUpdates(updates.map(u => u.id === editingId ? data : u));
        } else {
          // Thêm update mới
          setUpdates([data, ...updates]);
        }

        // Reset form
        setTitle("");
        setContent("");
        setImageUrl("");
        setSelectedTag("");
        setIsPinned(false);
        setEditingId(null);
        setShowForm(false);
      } else {
        alert(data.error || "Lỗi khi lưu cập nhật");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (update: any) => {
    setEditingId(update.id);
    setTitle(update.title);
    setContent(update.content);
    setImageUrl(update.imageUrl || "");
    setSelectedTag(update.tags?.[0] || "");
    setIsPinned(update.isPinned || false);
    setShowForm(true);

    // Scroll to form sau khi render
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setImageUrl("");
    setSelectedTag("");
    setIsPinned(false);
    setShowForm(false);
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm("Bạn có chắc muốn xóa cập nhật này?")) return;

    try {
      const res = await fetch(`/api/campaigns/${slug}/updates/${updateId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setUpdates(updates.filter(u => u.id !== updateId));
      } else {
        alert(data.error || "Lỗi khi xóa cập nhật");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-12">
      {/* Nút bật form (Chỉ cho chủ dự án) */}
      {isCreator && (
        <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] shadow-soft">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">Cập nhật tiến độ dự án</h3>
            <p className="text-xs text-blue-600 font-black uppercase tracking-widest leading-relaxed">Chia sẻ tin vui với những người ủng hộ bạn!</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="h-14 px-8 bg-blue-600 text-white font-black rounded-2xl hover:bg-black transition flex items-center gap-2 shadow-lg active:scale-95"
          >
            <PlusCircle size={20} />
            {showForm ? "Đóng Form" : "Đăng cập nhật mới"}
          </Button>
        </div>
      )}

      {/* Form đăng cập nhật */}
      {showForm && (
        <div ref={formRef} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-premium animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900">
              {editingId ? "Chỉnh sửa cập nhật" : "Đăng cập nhật mới"}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 flex items-center gap-2 text-sm font-bold"
              >
                <X size={16} />
                Hủy chỉnh sửa
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Tiêu đề bản tin</label>
              <input
                className="w-full p-6 bg-gray-50 border-0 rounded-[1.5rem] focus:ring-2 focus:ring-blue-600 text-lg font-black placeholder:text-gray-400 leading-none"
                placeholder="VD: Chúng ta đã đạt 50% mục tiêu! 🎉"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest">Nội dung chi tiết</label>
              <ProductionEditor
                content={content}
                onChange={setContent}
                config={{
                  placeholder: EDITOR_PLACEHOLDERS.UPDATE_POST,
                  autosave: false,
                  enableBubbleMenu: true,
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Tag size={14} />
                Phân loại (Chọn 1 mục)
              </label>

              <select
                className="w-full p-4 bg-gray-50 border-0 rounded-[1.5rem] focus:ring-2 focus:ring-blue-600 text-sm font-bold"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">-- Không chọn --</option>
                {AVAILABLE_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {selectedTag && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-bold">Đã chọn:</span>
                  <span className={`inline-flex items-center gap-1 px-4 py-2 ${getTagStyle(selectedTag).bg} ${getTagStyle(selectedTag).text} border ${getTagStyle(selectedTag).border} rounded-full text-sm font-bold`}>
                    #{selectedTag}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="isPinned" className="text-sm font-bold text-amber-900 flex items-center gap-2 cursor-pointer">
                <Pin size={16} />
                Ghim bản tin này lên đầu (Quan trọng)
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-18 px-12 bg-gray-900 text-white font-black rounded-[1.8rem] hover:bg-blue-600 transition flex items-center gap-3 shadow-xl active:scale-95"
              >
                <Send size={20} />
                {editingId ? "Cập nhật" : "Phát hành cập nhật"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="text-gray-400" size={18} />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-bold"
              >
                <option value="">Tất cả phân loại</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(searchQuery || filterTag) && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-bold">Đang lọc:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                "{searchQuery}"
              </span>
            )}
            {filterTag && (
              <span className={`px-3 py-1 ${getTagStyle(filterTag).bg} ${getTagStyle(filterTag).text} rounded-full font-bold`}>
                #{filterTag}
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(""); setFilterTag(""); }}
              className="ml-2 text-gray-400 hover:text-gray-600 underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Layout with Sidebar - Kickstarter style */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - List of updates */}
        {!fetching && updates.length > 0 && (
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
                Danh sách cập nhật
              </h3>
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {updates.map((update) => (
                  <a
                    key={update.id}
                    href={`#update-${update.id}`}
                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="flex items-start gap-2">
                      {update.isPinned && (
                        <Pin size={12} className="text-amber-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                          {update.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(update.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        {update.tags && update.tags.length > 0 && (
                          <span className={`inline-block mt-1 px-2 py-0.5 ${getTagStyle(update.tags[0]).bg} ${getTagStyle(update.tags[0]).text} rounded text-xs font-bold`}>
                            {update.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Update details */}
        <div className="flex-1 min-w-0">
          <div className="relative space-y-12">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">
              Lịch sử cập nhật chiến dịch ({updates.length})
            </h3>

            {fetching ? (
              <div className="py-24 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs italic">Đang đồng bộ dữ liệu...</div>
            ) : updates.length > 0 ? (
              <div className="space-y-16">
                {updates.map((update, idx) => (
                  <div key={update.id} id={`update-${update.id}`} className="relative group animate-fade-in-up scroll-mt-4">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-[0.9] group-hover:text-blue-600 transition">{update.title}</h4>
                          {update.isPinned && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                              <Pin size={10} />
                              Ghim
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none bg-gray-50 px-3 py-1 rounded-full">{formatFullDateTime(update.createdAt)}</span>
                      </div>

                      {update.tags && update.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {update.tags.map((tag: string) => {
                            const style = getTagStyle(tag);
                            return (
                              <span key={tag} className={`px-4 py-2 ${style.bg} ${style.text} border ${style.border} rounded-full text-sm font-bold shadow-sm`}>
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-soft group-hover:shadow-premium transition-all duration-500">
                        <div className="mb-8">
                          <RichTextRenderer content={update.content} />
                        </div>
                        {update.imageUrl && (
                          <div className="relative w-full h-[400px] overflow-hidden rounded-[2rem] border border-gray-100 shadow-inner group/img">
                            <img src={update.imageUrl} alt="Update visuals" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                          </div>
                        )}

                        {/* Edit & Delete buttons for creator */}
                        {isCreator && (
                          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                            <button
                              onClick={() => handleEdit(update)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition text-sm font-bold"
                            >
                              <Edit2 size={16} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDelete(update.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-bold"
                            >
                              <Trash2 size={16} />
                              Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center glass-morphism rounded-[3rem]">
                <PlusCircle className="mx-auto text-gray-200 mb-4" size={56} />
                <p className="text-gray-400 font-black text-xs uppercase tracking-widest italic">
                  {searchQuery || filterTag ? "Không tìm thấy kết quả phù hợp." : "Chưa có cập nhật nào từ chủ dự án."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
