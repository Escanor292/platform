"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PlusCircle, User, Loader2, Sparkles, Send } from "lucide-react";
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

export default function UpdateSection({ campaignId, slug, isCreator }: UpdateSectionProps) {
  const { data: session } = useSession();
  const [updates, setUpdates] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchUpdates();
  }, [slug]);

  const fetchUpdates = async () => {
    try {
      const res = await fetch(`/api/campaigns/${slug}/updates`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUpdates(data);
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
      const res = await fetch(`/api/campaigns/${slug}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl,
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUpdates([data, ...updates]);
        setTitle("");
        setContent("");
        setImageUrl("");
        setShowForm(false);
      } else {
        alert(data.error || "Lỗi khi đăng cập nhật");
      }
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
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
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-premium animate-in slide-in-from-top-4 duration-500">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
               <ImageUpload 
                  label="Ảnh minh họa tiến độ (Tùy chọn)"
                  value={imageUrl}
                  onChange={setImageUrl}
               />
               <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-18 px-12 bg-gray-900 text-white font-black rounded-[1.8rem] hover:bg-blue-600 transition flex items-center gap-3 shadow-xl active:scale-95"
                  >
                    <Send size={20} />
                    Phát hành cập nhật
                  </Button>
               </div>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách cập nhật */}
      <div className="relative space-y-12">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">
          Lịch sử cập nhật chiến dịch ({updates.length})
        </h3>
        
        {fetching ? (
          <div className="py-24 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs italic">Đang đồng bộ dữ liệu...</div>
        ) : updates.length > 0 ? (
          <div className="space-y-16">
            {updates.map((update, idx) => (
              <div key={update.id} className="relative group animate-fade-in-up">
                {/* Timeline Line */}
                {idx !== updates.length - 1 && (
                   <div className="absolute left-10 top-20 bottom-[-64px] w-0.5 bg-gray-100 hidden md:block" />
                )}
                
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="hidden md:flex flex-shrink-0 w-20 h-20 bg-white rounded-[1.8rem] border-2 border-gray-100 items-center justify-center text-blue-600 shadow-soft">
                      <Sparkles size={32} />
                   </div>
                   <div className="flex-grow space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                         <h4 className="text-2xl font-black text-gray-900 tracking-tight leading-[0.9] group-hover:text-blue-600 transition">{update.title}</h4>
                         <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none bg-gray-50 px-3 py-1 rounded-full">{formatFullDateTime(update.createdAt)}</span>
                      </div>
                      <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-soft group-hover:shadow-premium transition-all duration-500">
                         <div className="mb-8">
                            <RichTextRenderer content={update.content} />
                         </div>
                         {update.imageUrl && (
                            <div className="relative w-full h-[400px] overflow-hidden rounded-[2rem] border border-gray-100 shadow-inner group/img">
                               <img src={update.imageUrl} alt="Update visuals" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center glass-morphism rounded-[3rem]">
             <PlusCircle className="mx-auto text-gray-200 mb-4" size={56} />
             <p className="text-gray-400 font-black text-xs uppercase tracking-widest italic">Chưa có cập nhật nào từ chủ dự án.</p>
          </div>
        )}
      </div>
    </div>
  );
}
