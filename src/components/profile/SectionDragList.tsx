'use client';

import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  PROFILE_SECTION_IDS,
  type ProfileCustomizationConfig,
} from '@/lib/profile-customization';
import { moveStudioSection, orderedStudioSections, STUDIO_SECTION_HINTS } from '@/components/profile/sectionOrder';
import { useState } from 'react';

const SECTION_LABELS: Record<(typeof PROFILE_SECTION_IDS)[number], string> = {
  hero: 'Ảnh bìa & nhận diện',
  about: 'Giới thiệu',
  projects: 'Dự án',
  campaigns: 'Chiến dịch',
  products: 'Sản phẩm',
  blog: 'Blog',
  pledges: 'Lịch sử ủng hộ',
  badges: 'Huy hiệu',
  achievements: 'Thành tích',
  analytics: 'Thống kê nâng cao',
  cta: 'Nút kêu gọi hành động',
};

export default function SectionDragList({
  config,
  onChange,
}: {
  config: ProfileCustomizationConfig;
  onChange: (next: ProfileCustomizationConfig) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const items = orderedStudioSections(config);

  const updateVisible = (id: string, visible: boolean) => {
    onChange({
      ...config,
      sections: config.sections.map((item) => item.id === id ? { ...item, visible } : item),
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragId(item.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragId) onChange(moveStudioSection(config, dragId, item.id));
            setDragId(null);
          }}
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-cream/70 p-3"
        >
          <GripVertical className="cursor-grab text-gray-400" size={18} />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-dblue">{SECTION_LABELS[item.id]}</div>
            <div className="text-xs text-gray-500">{STUDIO_SECTION_HINTS[item.id]} · tối đa {item.limit} mục</div>
          </div>
          <button
            aria-label="Đưa lên"
            disabled={index === 0}
            onClick={() => onChange(moveStudioSection(config, item.id, items[index - 1].id))}
            className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
          >
            <ChevronUp size={16} />
          </button>
          <button
            aria-label="Đưa xuống"
            disabled={index === items.length - 1}
            onClick={() => onChange(moveStudioSection(config, item.id, items[index + 1].id))}
            className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
          >
            <ChevronDown size={16} />
          </button>
          <input
            aria-label={`Hiện ${SECTION_LABELS[item.id]}`}
            type="checkbox"
            checked={item.visible}
            onChange={(event) => updateVisible(item.id, event.target.checked)}
            className="h-4 w-4 accent-pgreen"
          />
        </div>
      ))}
    </div>
  );
}
