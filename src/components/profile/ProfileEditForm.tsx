"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, X, Upload, Camera, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import SocialLinksEditor from "./SocialLinksEditor";
import { SocialLink } from "@/types/social";

interface ProfileEditFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    coverImage: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    phone: string | null;
    shippingAddress: string | null;
    socialLinks?: any;
  };
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    phone: user.phone || "",
    shippingAddress: user.shippingAddress || "",
    image: user.image || "",
    coverImage: user.coverImage || "",
    socialLinks: (user.socialLinks as SocialLink[]) || []
  });

  const handleFileUpload = async (file: File, type: "avatar" | "cover") => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingCover;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload thất bại");
      }

      const data = await response.json();
      
      if (type === "avatar") {
        setFormData(prev => ({ ...prev, image: data.secure_url }));
        toast.success("Upload ảnh đại diện thành công!");
      } else {
        setFormData(prev => ({ ...prev, coverImage: data.secure_url }));
        toast.success("Upload ảnh bìa thành công!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi upload ảnh");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Cập nhật thất bại");
      }

      toast.success("Cập nhật thành công!");
      router.push(`/profile/${user.id}`);
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
      {/* Name */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Tên hiển thị
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          placeholder="Nhập tên của bạn"
        />
      </div>

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Email
        </label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Giới thiệu
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
          placeholder="Viết vài dòng về bản thân..."
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Địa điểm
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          placeholder="Thành phố, Quốc gia"
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          placeholder="https://example.com"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Số điện thoại
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
          placeholder="0912345678"
        />
        <p className="text-xs text-gray-400 mt-1">Số điện thoại liên hệ của bạn</p>
      </div>

      {/* Shipping Address */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Địa chỉ nhận hàng
        </label>
        <textarea
          value={formData.shippingAddress}
          onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
        />
        <p className="text-xs text-gray-400 mt-1">Địa chỉ để nhận phần thưởng từ các dự án bạn ủng hộ</p>
      </div>

      {/* Social Links */}
      <div>
        <SocialLinksEditor
          value={formData.socialLinks}
          onChange={(links) => setFormData({ ...formData, socialLinks: links })}
        />
      </div>

      {/* Avatar */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">
          Ảnh đại diện
        </label>
        
        <div className="flex items-start gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            {formData.image ? (
              <img 
                src={formData.image} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                onError={(e) => {
                  e.currentTarget.src = "";
                  toast.error("URL ảnh không hợp lệ");
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                <Camera size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-3">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, "avatar");
              }}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="w-full px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              {uploadingAvatar ? "Đang upload..." : "Tải ảnh lên"}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-400">hoặc</span>
              </div>
            </div>

            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
              placeholder="Nhập URL ảnh"
            />
            
            {formData.image && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image: "" })}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Xóa ảnh đại diện
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Kích thước đề xuất: 400x400px, tối đa 5MB</p>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-3">
          Ảnh bìa
        </label>
        
        {/* Cover Preview */}
        {formData.coverImage && (
          <div className="relative h-40 rounded-2xl overflow-hidden mb-3 border-2 border-gray-100">
            <img 
              src={formData.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "";
                toast.error("URL ảnh bìa không hợp lệ");
              }}
            />
          </div>
        )}

        {/* Upload Controls */}
        <div className="space-y-3">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, "cover");
            }}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} />
            {uploadingCover ? "Đang upload..." : "Tải ảnh bìa lên"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-400">hoặc</span>
            </div>
          </div>

          <input
            type="url"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
            placeholder="Nhập URL ảnh bìa"
          />
          
          {formData.coverImage && (
            <button
              type="button"
              onClick={() => setFormData({ ...formData, coverImage: "" })}
              className="text-xs text-red-600 hover:text-red-700 font-semibold"
            >
              Xóa ảnh bìa
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Kích thước đề xuất: 1500x500px, tối đa 5MB</p>
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
          href={`/profile/${user.id}`}
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
