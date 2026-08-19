/**
 * Product Gallery
 * Ảnh sản phẩm dạng grid nhỏ dưới ảnh chính + video player nếu có
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string | null;
}

export default function ProductGallery({ images, videoUrl }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const mainImage = images[activeIndex] || images[0];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Main image / video */}
      <div className="relative flex-1 min-h-[280px] lg:min-h-[380px] bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-3xl">
        {videoUrl && activeIndex === 0 ? (
          <video
            src={videoUrl}
            controls
            playsInline
            className="max-h-full max-w-full w-full h-full object-contain bg-black"
          />
        ) : (
          <Image
            src={mainImage}
            alt="Sản phẩm"
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
        {videoUrl && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black/60 backdrop-blur px-2 py-1 rounded-full">
            <Play size={9} /> VIDEO
          </span>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-3 overflow-x-auto">
        {videoUrl && (
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
              activeIndex === 0 ? 'border-pgreen' : 'border-transparent'
            }`}
          >
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Play size={16} className="text-white" />
            </div>
          </button>
        )}
        {images.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setActiveIndex(videoUrl ? i + 1 : i)}
            className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
              (videoUrl ? i + 1 : i) === activeIndex ? 'border-pgreen' : 'border-transparent'
            }`}
          >
            <Image
              src={img}
              alt={`Ảnh ${i + 1}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
