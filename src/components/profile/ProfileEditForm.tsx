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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar & Cover Image Section */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-bold text-dblue mb-2">
          Ảnh đại diện & Ảnh bìa
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Cập nhật hình ảnh để hồ sơ của bạn nổi bật hơn.
        </p>

        <div className="space-y-8">
          {/* Avatar */}
          <div>
            <label className="mb-3 block text-sm font-bold text-dblue">
              Ảnh đại diện
            </label>

            <div className="flex items-start gap-6">
              {/* Avatar Preview */}
              <div className="relative">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full border-4 border-pgreen/10 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      toast.error("URL ảnh không hợp lệ");
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-pgreen/10 bg-pgreen/10 flex items-center justify-center">
                    <Camera size={32} className="text-pgreen" />
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold text-dblue transition hover:border-pgreen/30 hover:text-pgreen disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20 text-sm"
                  placeholder="Nhập URL ảnh"
                />

                {formData.image && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Xóa ảnh đại diện
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Kích thước đề xuất: 400x400px, tối đa 5MB</p>
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-3 block text-sm font-bold text-dblue">
              Ảnh bìa
            </label>

            {/* Cover Preview */}
            {formData.coverImage && (
              <div className="relative mb-3 h-40 overflow-hidden rounded-2xl border-2 border-pgreen/10">
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="h-full w-full object-cover"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold text-dblue transition hover:border-pgreen/30 hover:text-pgreen disabled:cursor-not-allowed disabled:opacity-60"
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
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20 text-sm"
                placeholder="Nhập URL ảnh bìa"
              />

              {formData.coverImage && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: "" })}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Xóa ảnh bìa
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">Kích thước đề xuất: 1500x500px, tối đa 5MB</p>
          </div>
        </div>
      </section>

      {/* Basic Information Section */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-bold text-dblue mb-2">
          Thông tin cơ bản
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Những thông tin sẽ hiển thị trên hồ sơ công khai của bạn.
        </p>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20"
              placeholder="Nhập tên của bạn"
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
          </div>

          {/* Bio */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Giới thiệu
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="min-h-32 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20 resize-none"
              placeholder="Viết vài dòng về bản thân..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Địa điểm
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20"
              placeholder="Thành phố, Quốc gia"
            />
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-bold text-dblue mb-2">
          Thông tin liên hệ
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Thông tin để cộng đồng có thể liên hệ với bạn.
        </p>

        <div className="space-y-6">
          {/* Website */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20"
              placeholder="https://example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20"
              placeholder="0912345678"
            />
            <p className="mt-1 text-xs text-gray-500">Số điện thoại liên hệ của bạn</p>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="mb-2 block text-sm font-bold text-dblue">
              Địa chỉ nhận hàng
            </label>
            <textarea
              value={formData.shippingAddress}
              onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              rows={3}
              className="min-h-24 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-pgreen focus:ring-pgreen/20 resize-none"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
            <p className="mt-1 text-xs text-gray-500">Địa chỉ để nhận phần thưởng từ các dự án bạn ủng hộ</p>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl font-bold text-dblue mb-2">
          Liên kết mạng xã hội
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Kết nối các mạng xã hội của bạn để cộng đồng dễ dàng tìm thấy.
        </p>

        <SocialLinksEditor
          value={formData.socialLinks}
          onChange={(links) => setFormData({ ...formData, socialLinks: links })}
        />
      </section>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl gradient-green px-6 py-3 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={20} />
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <Link
          href={`/profile/${user.id}`}
          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 font-bold text-dblue transition hover:border-pgreen/30 hover:text-pgreen"
        >
          <X size={20} />
          Hủy
        </Link>
      </div>
    </form>
  );
}
