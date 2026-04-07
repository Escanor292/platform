"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, className, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onChange(data.secure_url);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Tải ảnh lên thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {label && <label className="text-sm font-black text-gray-900 uppercase tracking-widest">{label}</label>}
      
      <div 
        onClick={() => !value && fileInputRef.current?.click()}
        className={cn(
          "relative min-h-[150px] border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center transition-all group overflow-hidden",
          !value && "hover:border-blue-600 hover:bg-blue-50/50 cursor-pointer",
          value && "border-solid border-gray-100"
        )}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleUpload}
          accept="image/*"
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
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-blue-600 transition">
             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition">
                <ImageIcon size={28} />
             </div>
             <div className="text-center">
                <p className="text-sm font-black uppercase tracking-tighter">Bấm để tải ảnh</p>
                <p className="text-[10px] font-medium opacity-60">PNG, JPG, WEBP (Max 5MB)</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
