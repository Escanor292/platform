'use client';

import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  PROFILE_SECTION_IDS,
  type ProfileCustomizationConfig,
  type ProfileSection,
} from '@/lib/profile-customization';
import {
  moveStudioSection,
  orderedGroupSections,
  STUDIO_SECTION_HINTS,
  type StudioGroupId,
} from '@/components/profile/sectionOrder';
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

const GROUPS: Array<{ id: StudioGroupId; title: string; hint: string; sortable: boolean }> = [
  {
    id: 'chrome',
    title: 'Đầu trang (khách luôn thấy trước)',
    hint: 'Ảnh bìa và giới thiệu không đổi vị trí — chỉ bật/tắt.',
    sortable: false,
  },
  {
    id: 'publicTabs',
    title: 'Thanh tab công khai',
    hint: 'Kéo để đổi thứ tự tab mà khách thấy trên profile.',
    sortable: true,
  },
  {
    id: 'ownerTabs',
    title: 'Chỉ chủ trang thấy',
    hint: 'Khách không thấy tab này dù đang bật.',
    sortable: false,
  },
  {
    id: 'extra',
    title: 'Khối phụ',
    hint: 'Không nằm trong thanh tab.',
    sortable: true,
  },
];

function Row({
  item,
  index,
  items,
  sortable,
  dragId,
  setDragId,
  config,
  onChange,
  updateVisible,
}: {
  item: ProfileSection;
  index: number;
  items: ProfileSection[];
  sortable: boolean;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  config: ProfileCustomizationConfig;
  onChange: (next: ProfileCustomizationConfig) => void;
  updateVisible: (id: string, visible: boolean) => void;
}) {
  return (
    <div
      draggable={sortable}
      onDragStart={() => {
        if (sortable) setDragId(item.id);
      }}
      onDragOver={(event) => {
        if (sortable) event.preventDefault();
      }}
      onDrop={() => {
        if (sortable && dragId) onChange(moveStudioSection(config, dragId, item.id));
        setDragId(null);
      }}
      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-cream/70 p-3"
    >
      <GripVertical className={sortable ? 'cursor-grab text-gray-400' : 'text-gray-300'} size={18} />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-dblue">{SECTION_LABELS[item.id]}</div>
        <div className="text-xs text-gray-500">{STUDIO_SECTION_HINTS[item.id]} · tối đa {item.limit} mục</div>
      </div>
      {sortable && (
        <>
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
        </>
      )}
      <input
        aria-label={`Hiện ${SECTION_LABELS[item.id]}`}
        type="checkbox"
        checked={item.visible}
        onChange={(event) => updateVisible(item.id, event.target.checked)}
        className="h-4 w-4 accent-pgreen"
      />
    </div>
  );
}

export default function SectionDragList({
  config,
  onChange,
}: {
  config: ProfileCustomizationConfig;
  onChange: (next: ProfileCustomizationConfig) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  const updateVisible = (id: string, visible: boolean) => {
    onChange({
      ...config,
      sections: config.sections.map((item) => (item.id === id ? { ...item, visible } : item)),
    });
  };

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const items = orderedGroupSections(config, group.id);
        if (items.length === 0) return null;
        return (
          <div key={group.id} className="space-y-2">
            <div>
              <div className="text-sm font-black text-dblue">{group.title}</div>
              <p className="text-xs text-gray-500">{group.hint}</p>
            </div>
            {items.map((item, index) => (
              <Row
                key={item.id}
                item={item}
                index={index}
                items={items}
                sortable={group.sortable}
                dragId={dragId}
                setDragId={setDragId}
                config={config}
                onChange={onChange}
                updateVisible={updateVisible}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
