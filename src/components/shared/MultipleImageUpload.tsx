"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MultipleImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  mainImage?: string;
  onMainImageChange?: (url: string) => void;
  maxImages?: number;
  className?: string;
  label?: string;
}

export function MultipleImageUpload({ 
  images, 
  onChange, 
  mainImage,
  onMainImageChange,
  maxImages = 10,
  className, 
  label 
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("[MultipleImageUpload] Render - images:", images, "mainImage:", mainImage);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError("");

    // Check max images limit
    if (images.length >= maxImages) {
      const errorMsg = `Tối đa ${maxImages} ảnh`;
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = "Kích thước file tối đa 5MB";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const imageUrl = data.secure_url || data.url;
      if (!imageUrl) {
        throw new Error("No image URL returned from server");
      }

      console.log("[MultipleImageUpload] Upload success:", imageUrl);
      console.log("[MultipleImageUpload] Current images:", images);

      // Add to images array
      const newImages = [...images, imageUrl];
      console.log("[MultipleImageUpload] New images array:", newImages);
      onChange(newImages);

      // Set as main image if it's the first one
      if (images.length === 0 && onMainImageChange) {
        console.log("[MultipleImageUpload] Setting as main image:", imageUrl);
        onMainImageChange(imageUrl);
      }

      toast.success("Tải ảnh lên thành công!");
    } catch (error: any) {
      console.error("Upload Error:", error);
      const errorMsg = error.message || "Tải ảnh lên thất bại. Vui lòng thử lại.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);

    // If removing main image, set first remaining image as main
    if (imageToRemove === mainImage && onMainImageChange) {
      onMainImageChange(newImages[0] || "");
    }

    setError("");
    toast.success("Đã xóa ảnh");
  };

  const setAsMainImage = (url: string) => {
    if (onMainImageChange) {
      onMainImageChange(url);
      toast.success("Đã đặt làm ảnh bìa chính");
    }
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {label && (
        <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-gray-400 font-normal text-xs">
            {images.length}/{maxImages} ảnh
          </span>
        </label>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-300 transition-all"
            >
              <img 
                src={img} 
                alt={`Image ${index + 1}`} 
                className="w-full h-full object-cover"
              />
              
              {/* Main image indicator */}
              {mainImage === img && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                  <Star size={12} fill="white" />
                  Ảnh bìa
                </div>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {mainImage !== img && onMainImageChange && (
                  <button
                    onClick={() => setAsMainImage(img)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    title="Đặt làm ảnh bìa"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Xóa ảnh"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={cn(
            "relative min-h-[150px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center transition-all group cursor-pointer",
            !isUploading && "hover:border-blue-600 hover:bg-blue-50/50",
            error && "border-red-300 bg-red-50/30"
          )}
        >
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUpload}
            accept="image/*"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải lên...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-blue-600 transition">
              <div className={cn(
                "w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition",
                error && "bg-red-50"
              )}>
                <Upload size={24} className={error ? "text-red-400" : ""} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">Thêm ảnh</p>
                <p className="text-xs opacity-60">PNG, JPG, WEBP (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Helper text */}
      {images.length === 0 && !error && (
        <p className="text-xs text-gray-500 text-center">
          Ảnh đầu tiên sẽ được dùng làm ảnh bìa chính. Bạn có thể thêm tối đa {maxImages} ảnh.
        </p>
      )}
    </div>
  );
}
