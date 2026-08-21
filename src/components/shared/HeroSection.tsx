'use client';

import Link from 'next/link';
import { Rocket, Compass, Heart } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import LeafIcon to avoid SSR issues
const LeafIcon = dynamic(() => import('./LeafIcon'), {
  ssr: false,
  loading: () => <div className="w-40 h-40 bg-gray-200 rounded-full animate-pulse" />
});

interface PlatformStats {
  totalFunds: string;
  successfulCampaigns: number;
  totalBackers: number;
}

export default function HeroSection() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent double fetching in React Strict Mode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Cleanup previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    async function fetchStats() {
      try {
        const response = await fetch('/api/stats', {
          signal: abortControllerRef.current?.signal,
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          // Use fallback stats if API fails
          setStats({
            totalFunds: "2.5 tỷ",
            successfulCampaigns: 1250,
            totalBackers: 15000,
          });
          return;
        }

        const data: PlatformStats = await response.json();

        // Only update if component is still mounted
        if (!abortControllerRef.current?.signal.aborted) {
          setStats(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching stats:', error);

        // Use fallback stats on error
        setStats({
          totalFunds: "2.5 tỷ",
          successfulCampaigns: 1250,
          totalBackers: 15000,
        });
      }
    }

    fetchStats();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  return (
    <section
      className="pt-28 pb-24 px-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #F8F7F2 0%, #f0f8f4 25%, #ecf2f9 55%, #f4f3f0 80%, #F8F7F2 100%)'
      }}
    >
      {/* Animated background elements with layered depth */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-[5%] w-96 h-96 bg-gradient-to-br from-fgreen/20 via-fgreen/8 to-transparent rounded-full blur-3xl opacity-70"
          style={{ animation: 'pulse 8s ease-in-out infinite' }}
        />
        <div
          className="absolute top-32 right-[8%] w-80 h-80 bg-gradient-to-tl from-tblue/15 via-transparent to-transparent rounded-full blur-3xl opacity-60"
          style={{ animation: 'pulse 10s ease-in-out 2s infinite' }}
        />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-gradient-to-tr from-pgreen/12 via-transparent to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-l from-ebrown/8 to-transparent rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* LEFT: Text Content */}
        <div className="flex-1 slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md bg-white/55 border border-white/70 text-pgreen text-xs font-bold mb-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-4 h-4 rounded-full bg-pgreen animate-pulse" />
            <span>🏆 Nền tảng gây quỹ cộng đồng #2 Việt Nam</span>
          </div>
          <p className="mt-2 ml-2 text-[11px] italic text-gray-500">Vì chưa có tài liệu chứng minh</p>

          {/* Main Headline */}
          <h1 className="font-display font-black text-6xl lg:text-7xl xl:text-8xl text-dblue mb-8 drop-shadow-lg" style={{ letterSpacing: '0.02em', lineHeight: '1.3' }}>
            Lấy sự tử tế<br />
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-pgreen via-fgreen to-tblue animate-gradient"
              style={{ backgroundSize: '200% 200%' }}
            >
              trồng tương lai
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-700 max-w-2xl mb-12 leading-relaxed font-light">
            Mỗi đóng góp hôm nay giúp nuôi lớn một tương lai tốt đẹp hơn. Chúng tôi là nơi sự tử tế được gieo mầm, niềm tin được nuôi dưỡng, và cộng đồng cùng nhau thay đổi thế giới.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 items-start mb-10">
            <Link
              href="/campaigns/create"
              className="group px-8 py-4 rounded-2xl gradient-green text-white font-bold text-base hover:shadow-2xl hover:shadow-green-400/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5 transform"
            >
              <Rocket className="w-5 h-5 group-hover:scale-110 transition" />
              <span>Bắt đầu gây quỹ</span>
            </Link>
            <Link
              href="/campaigns"
              className="px-8 py-4 rounded-2xl glass border border-white/70 text-dblue font-bold text-base hover:bg-white/80 hover:border-white hover:shadow-lg transition-all duration-300 flex items-center gap-2.5"
            >
              <Compass className="w-5 h-5" />
              <span>Khám phá chiến dịch</span>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pgreen to-fgreen border-2 border-white flex items-center justify-center text-white text-xs font-bold">N</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-tblue to-dblue border-2 border-white flex items-center justify-center text-white text-xs font-bold">T</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ebrown to-amber-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">L</div>
              </div>
              <span className="text-gray-600 font-semibold">
                {stats ? stats.totalBackers.toLocaleString('vi-VN') : '...'} người ủng hộ
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              <span className="font-bold text-pgreen">
                {stats ? stats.successfulCampaigns.toLocaleString('vi-VN') : '...'}
              </span> chiến dịch thành công
            </span>
          </div>
        </div>

        {/* RIGHT: Visual Element */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-full max-w-md h-96">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pgreen/8 to-tblue/8 blur-3xl opacity-70 group-hover:opacity-100 transition duration-700" />

            {/* Main glass morphism card */}
            <div className="relative rounded-3xl overflow-hidden group">
              {/* Premium glass background */}
              <div
                className="absolute inset-0 backdrop-blur-xl bg-white/40 border border-white/70 shadow-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)' }}
              />

              {/* Animated gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pgreen/5 via-transparent to-tblue/5 group-hover:from-pgreen/8 group-hover:via-fgreen/8 group-hover:to-tblue/8 transition duration-700 opacity-0 group-hover:opacity-100" />

              {/* Content */}
              <div className="relative z-10 h-96 flex flex-col items-center justify-center px-8">
                {/* Animated leaf SVG */}
                <div className="leaf-float mb-4">
                  <LeafIcon className="w-40 h-40" />
                </div>

                {/* Text */}
                <h3 className="text-center text-pgreen font-display font-bold text-2xl">
                  Gieo mầm hy vọng
                </h3>
                <p className="text-center text-gray-500 text-sm mt-1 font-light">
                  Kết nối yêu thương
                </p>

                {/* Progress indicator */}
                <div className="mt-8 px-6 py-3 rounded-full backdrop-blur-sm bg-pgreen/5 border border-pgreen/20 text-xs font-semibold text-pgreen">
                  ✨ Đang giúp {stats ? stats.totalBackers.toLocaleString('vi-VN') : '...'} người thay đổi thế giới
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div
              className="absolute -top-8 -right-8 rounded-2xl backdrop-blur-md bg-white/70 border border-white/80 px-6 py-5 shadow-2xl slide-up hover:shadow-3xl transition-all duration-300"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full gradient-green flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Heart className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500">Ủng hộ vừa rồi</div>
                  <div className="text-base font-display font-bold text-pgreen">+2.5 triệu</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
