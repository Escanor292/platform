"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/ImageUpload";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { toast } from "sonner";
import { Rocket, Target, AlignLeft, Image as ImageIcon, Calendar } from "lucide-react";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    goalAmount: 1000000,
    category: "Phát triển",
    imageUrl: "",
    endDate: "",
  });

  const [displayAmount, setDisplayAmount] = useState("1.000.000");

  const formatVNDInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("vi-VN").format(Number(numericValue));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatVNDInput(rawValue);
    const numeric = Number(rawValue.replace(/\D/g, ""));

    setDisplayAmount(formatted);
    setFormData({ ...formData, goalAmount: numeric });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.tagline || !formData.description || !formData.endDate || !formData.imageUrl) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }
    
    setLoading(true);
    const promise = fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Lỗi khi tạo dự án");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Đang khởi tạo dự án...',
      success: (campaign) => {
        router.push(`/campaigns/${campaign.slug}`);
        return '🎉 Tạo dự án thành công!';
      },
      error: (err) => err.message,
    });
    
    promise.finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Rocket size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Bắt đầu mạch cảm hứng mới</h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Hãy chia sẻ câu chuyện của bạn với thế giới. Chúng tôi sẽ giúp bạn kết nối với cộng đồng để biến ý tưởng thành hiện thực hiện hữu.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Block 1: Thông tin cơ bản */}
          <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <AlignLeft size={20} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
            </div>

            <div className="space-y-8">
               <div className="space-y-3">
                 <label className="text-sm font-bold text-gray-900 flex justify-between">
                    Tên dự án <span className="text-gray-400 font-normal">Tối đa 60 ký tự</span>
                 </label>
                 <Input 
                   required 
                   className="text-lg py-6 focus-ring rounded-xl bg-slate-50 border-gray-200"
                   placeholder="Ví dụ: Năng lượng xanh cho bản vùng cao..." 
                   value={formData.title}
                   maxLength={60}
                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                 />
               </div>

               <div className="space-y-3">
                 <label className="text-sm font-bold text-gray-900">Mô tả ngắn (Tagline)</label>
                 <Input 
                   required 
                   className="py-5 focus-ring rounded-xl bg-slate-50 border-gray-200"
                   placeholder="Câu tóm tắt ngắn gọn và cuốn hút nhất về dự án của bạn..." 
                   value={formData.tagline}
                   onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                 />
               </div>
            </div>
          </div>

          {/* Block 2: Nội dung & Hình ảnh */}
          <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ImageIcon size={20} />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-gray-900">Câu chuyện & Media</h2>
                 <p className="text-sm text-gray-500 font-medium">Một câu chuyện hay cùng hình ảnh đẹp sẽ thu hút nhiều sự chú ý hơn.</p>
               </div>
            </div>

            <div className="space-y-10">
               <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-900">Ảnh bìa chiến dịch</label>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-gray-300">
                     <ImageUpload 
                        label="Tải ảnh lên (Tỉ lệ khuyến nghị 16:9)"
                        value={formData.imageUrl}
                        onChange={(url: string) => setFormData({ ...formData, imageUrl: url })}
                     />
                  </div>
               </div>

               <div className="space-y-3">
                 <label className="text-sm font-bold text-gray-900">Nội dung chi tiết</label>
                 <RichTextEditor 
                   content={formData.description}
                   onChange={(content) => setFormData({ ...formData, description: content })}
                   placeholder="Hãy kể một câu chuyện thật chân thành..."
                 />
               </div>
            </div>
          </div>

          {/* Block 3: Mục tiêu & Thời gian */}
          <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-soft">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Target size={20} />
               </div>
               <h2 className="text-2xl font-bold text-gray-900">Mục tiêu & Lịch trình</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900">Số vốn mục tiêu (VNĐ)</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
                   <Input 
                     type="text" 
                     className="pl-10 text-lg font-black text-gray-900 py-6 focus-ring rounded-xl bg-slate-50 border-gray-200"
                     required 
                     placeholder="1.000.000"
                     value={displayAmount}
                     onChange={handleAmountChange}
                   />
                </div>
                <p className="text-xs text-gray-500 font-medium">Đặt mục tiêu có thể đạt được để tạo động lực cho cộng đồng.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-900">Hạn chót chiến dịch</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar size={18} />
                   </span>
                   <Input 
                     type="date" 
                     className="pl-12 py-6 text-gray-900 font-bold focus-ring rounded-xl bg-slate-50 border-gray-200"
                     required 
                     value={formData.endDate}
                     onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                   />
                </div>
                <p className="text-xs text-gray-500 font-medium">Thời gian tối đa thường là 30 - 60 ngày.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
               type="submit" 
               disabled={loading} 
               className={`
                  btn-primary w-full md:w-auto px-12 py-5 text-lg shadow-[0_8px_30px_rgb(37,99,235,0.3)]
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}
               `}
            >
               {loading ? (
                  <span className="flex items-center gap-2">
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Đang khởi tạo...
                  </span>
               ) : (
                  <span className="flex items-center gap-2">
                     Khởi tạo chiến dịch ngay <Rocket size={20} className="ml-2"/>
                  </span>
               )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
