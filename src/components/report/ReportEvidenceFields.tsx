'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const MAX_IMAGES = 5;

export default function ReportEvidenceFields({
  occurredAt,
  onOccurredAtChange,
  imageUrls,
  onImageUrlsChange,
  disabled,
}: {
  occurredAt: string;
  onOccurredAtChange: (value: string) => void;
  imageUrls: string[];
  onImageUrlsChange: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }
    setUploading(true);
    const uploaded = [...imageUrls];
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        if (!file.type.startsWith('image/')) {
          toast.error('Chỉ nhận file ảnh');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} vượt quá 5MB`);
          continue;
        }
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Tải ảnh thất bại');
        const url = data.secure_url || data.url;
        if (url) uploaded.push(url);
      }
      onImageUrlsChange(uploaded.slice(0, MAX_IMAGES));
    } catch (error: any) {
      toast.error(error.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Thời gian vụ việc <span className="text-xs font-normal text-gray-400">(không bắt buộc)</span>
        </label>
        <input
          type="datetime-local"
          value={occurredAt}
          onChange={(event) => onOccurredAtChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Hình ảnh minh chứng <span className="text-xs font-normal text-gray-400">(không bắt buộc)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url) => (
            <div key={url} className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onImageUrlsChange(imageUrls.filter((item) => item !== url))}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {imageUrls.length < MAX_IMAGES && (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 text-gray-400 disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(event) => handleUpload(event.target.files)}
        />
      </div>
    </>
  );
}
