"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full rounded-[3rem] overflow-hidden bg-gray-100 shadow-premium border-8 border-white p-2">
        <div className="w-full h-full bg-gray-200 rounded-[2.5rem] flex items-center justify-center">
          <span className="text-gray-400 font-bold">Không có ảnh</span>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="aspect-video w-full rounded-[3rem] overflow-hidden bg-gray-100 shadow-premium border-8 border-white p-2 relative group">
      {/* Main Image */}
      <img
        src={images[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded-[2.5rem]"
      />

      {/* Navigation Arrows - Only show if more than 1 image */}
      {images.length > 1 && (
        <>
          {/* Left Click Area - invisible but clickable */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-w-resize z-10"
            aria-label="Previous image area"
          />

          {/* Right Click Area - invisible but clickable */}
          <button
            onClick={goToNext}
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-e-resize z-10"
            aria-label="Next image area"
          />

          {/* Left Arrow Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
            aria-label="Previous image button"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
            aria-label="Next image button"
          >
            <ChevronRight size={24} className="text-gray-900" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-6 right-6 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
