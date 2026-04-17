"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { ProductionEditor } from "@/components/editor";
import { EDITOR_PLACEHOLDERS } from "@/lib/editor/constants";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  quantity: number | null;
  remaining: number | null;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  imageUrl: string | null;
  images: string[];
  videoUrl: string | null;
  category: string;
  goalAmount: number;
  endDate: Date | null;
  rewards: Reward[];
}

interface CampaignEditFormProps {
  campaign: Campaign;
}

export default function CampaignEditForm({ campaign }: CampaignEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: campaign.title,
    description: campaign.description,
    longDescription: campaign.longDescription || "",
    imageUrl: campaign.imageUrl || "",
    images: campaign.images || [],
    videoUrl: campaign.videoUrl || "",
    category: campaign.category,
    goalAmount: campaign.goalAmount,
    endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : "",
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Upload thất bại");
      }

      const data = await response.json();
      
      // Thêm ảnh vào mảng images
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, data.secure_url],
        // Set ảnh đầu tiên làm imageUrl chính nếu chưa có
        imageUrl: prev.imageUrl || data.secure_url
      }));
      toast.success("Upload ảnh thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi upload ảnh");
      console.error("Upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        // Nếu xóa ảnh chính, set ảnh đầu tiên còn lại làm ảnh chính
        imageUrl: prev.imageUrl === prev.images[index] 
          ? (newImages[0] || "") 
          : prev.imageUrl
      };
    });
  };

  const setMainImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
    toast.success("Đã đặt làm ảnh chính");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Cập nhật thất bại");
      }

      toast.success("Cập nhật dự án thành công!");
      router.push("/dashboard/creator");
      router.refresh();
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
        
        {/* Ảnh dự án */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Ảnh dự án
          </label>
          
          {/* Gallery hiển thị các ảnh */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={img} 
                    alt={`Image ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-xl border-2 border-gray-100"
                  />
                  {/* Badge ảnh chính */}
                  {img === formData.imageUrl && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">
                      Ảnh chính
                    </div>
                  )}
                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                    {img !== formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setMainImage(img)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                      >
                        Đặt làm chính
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
              id="image-upload"
            />
            
            <label
              htmlFor="image-upload"
              className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <ImageIcon size={18} />
              {uploadingImage ? "Đang upload..." : "Thêm ảnh"}
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Kích thước đề xuất: 1200x600px, tối đa 5MB. Ảnh đầu tiên sẽ là ảnh chính.
          </p>
        </div>

        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tiêu đề dự án
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
            placeholder="Nhập tiêu đề dự án"
          />
        </div>

        {/* Mô tả ngắn */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Mô tả ngắn
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
            placeholder="Mô tả ngắn gọn về dự án"
          />
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Mô tả chi tiết
          </label>
          <ProductionEditor
            content={formData.longDescription}
            onChange={(content) => setFormData({ ...formData, longDescription: content })}
            config={{
              placeholder: EDITOR_PLACEHOLDERS.CAMPAIGN_DESCRIPTION,
              autosave: false,
              enableBubbleMenu: true,
            }}
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Danh mục
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          >
            <option value="technology">Công nghệ</option>
            <option value="art">Nghệ thuật</option>
            <option value="education">Giáo dục</option>
            <option value="health">Sức khỏe</option>
            <option value="environment">Môi trường</option>
            <option value="community">Cộng đồng</option>
          </select>
        </div>

        {/* Mục tiêu */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Mục tiêu huy động (VNĐ)
          </label>
          <input
            type="number"
            value={formData.goalAmount}
            onChange={(e) => setFormData({ ...formData, goalAmount: Number(e.target.value) })}
            required
            min={1000000}
            step={100000}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {/* Ngày kết thúc */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Ngày kết thúc
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <Link
            href="/dashboard/creator"
            className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <X size={20} />
            Hủy
          </Link>
        </div>
      </div>
    </form>
  );
}
