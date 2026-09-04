"use client";

import { useState, useRef } from "react";
import { X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFile?: (file: File) => void;
  className?: string;
  label?: string;
  capture?: boolean | "user" | "environment";
}

export function ImageUpload({ value, onChange, onFile, className, label, capture }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = "Kích thước file tối đa 5MB";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    onFile?.(file);

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

      onChange(imageUrl);
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

  const captureAttr = capture === true ? "environment" : capture || undefined;

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {label && <label className="text-sm font-black text-gray-900 uppercase tracking-widest">{label}</label>}

      <div
        onClick={() => !value && !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative min-h-[150px] border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center transition-all group overflow-hidden",
          !value && !isUploading && "hover:border-blue-600 hover:bg-blue-50/50 cursor-pointer",
          value && "border-solid border-gray-100",
          error && "border-red-300 bg-red-50/30",
        )}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          capture={captureAttr}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đang tải lên...</span>
          </div>
        ) : value ? (
          <div className="relative w-full h-full min-h-[200px]">
            <img src={value} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setError("");
              }}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-blue-600 transition">
            <div className={cn(
              "w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition",
              error && "bg-red-50",
            )}>
              <ImageIcon size={28} className={error ? "text-red-400" : ""} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-tighter">Bấm để chụp / tải ảnh</p>
              <p className="text-[10px] font-medium opacity-60">PNG, JPG, WEBP (Max 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
