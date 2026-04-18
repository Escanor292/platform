'use client';

import { useState } from 'react';
import CampaignGrowthProgress from '@/components/campaign/CampaignGrowthProgress';

export default function ProgressDemo() {
  const [amount, setAmount] = useState(350000000);
  const goalAmount = 500000000;

  const presets = [
    { label: '15% - Mầm', value: 75000000 },
    { label: '45% - Đang lớn', value: 225000000 },
    { label: '80% - Sắp trái', value: 400000000 },
    { label: '100% - Kết trái', value: 500000000 },
    { label: '120% - Vượt mục tiêu', value: 600000000 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Campaign Growth Progress
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Thanh tiến độ với hệ thống cây phát triển theo giai đoạn
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                Số tiền hiện tại: {amount.toLocaleString('vi-VN')} VND
              </span>
              <input
                type="range"
                min="0"
                max={goalAmount * 1.5}
                step="10000000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setAmount(preset.value)}
                  className="px-4 py-2 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-xl text-sm font-bold transition active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Large variant */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
            Large Size (Default)
          </h2>
          <CampaignGrowthProgress
            currentAmount={amount}
            goalAmount={goalAmount}
            size="lg"
          />
        </div>

        {/* Medium variant */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
            Medium Size
          </h2>
          <CampaignGrowthProgress
            currentAmount={amount}
            goalAmount={goalAmount}
            size="md"
          />
        </div>

        {/* Small variant */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Small Size
          </h2>
          <CampaignGrowthProgress
            currentAmount={amount}
            goalAmount={goalAmount}
            size="sm"
          />
        </div>

        {/* Compact variant */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Compact Variant (No Tree)
          </h2>
          <CampaignGrowthProgress
            currentAmount={amount}
            goalAmount={goalAmount}
            variant="compact"
            size="md"
          />
        </div>

        {/* Without animated head */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">
            Without Animated Orb
          </h2>
          <CampaignGrowthProgress
            currentAmount={amount}
            goalAmount={goalAmount}
            showAnimatedHead={false}
            size="md"
          />
        </div>

        {/* Multiple examples side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Dự án A - 25%
            </h3>
            <CampaignGrowthProgress
              currentAmount={125000000}
              goalAmount={500000000}
              size="sm"
            />
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Dự án B - 55%
            </h3>
            <CampaignGrowthProgress
              currentAmount={275000000}
              goalAmount={500000000}
              size="sm"
            />
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Dự án C - 85%
            </h3>
            <CampaignGrowthProgress
              currentAmount={425000000}
              goalAmount={500000000}
              size="sm"
            />
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Dự án D - 100%
            </h3>
            <CampaignGrowthProgress
              currentAmount={500000000}
              goalAmount={500000000}
              size="sm"
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100">
          <h3 className="text-lg font-black text-emerald-900 mb-4">
            Giai đoạn phát triển
          </h3>
          <div className="space-y-3 text-sm text-emerald-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span><strong>0-32%:</strong> Mầm hy vọng - Dự án mới bắt đầu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span><strong>33-65%:</strong> Đang lớn mạnh - Đang phát triển tốt</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span><strong>66-99%:</strong> Sắp đơm trái - Gần đạt mục tiêu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-600 to-amber-500" />
              <span><strong>100%+:</strong> Đã kết trái - Thành công rực rỡ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
