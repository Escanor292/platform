'use client';

import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import {
  PROFILE_TAB_SECTION_IDS,
  type ProfileAudience,
  type ProfileCustomizationConfig,
  type ProfileSection,
} from '@/lib/profile-customization';
import {
  moveStudioSection,
  orderedGroupSections,
  setStudioSectionVisible,
  STUDIO_SECTION_HINTS,
  type StudioGroupId,
} from '@/components/profile/sectionOrder';
import { useState } from 'react';

const SECTION_LABELS: Record<string, string> = {
  hero: 'Ảnh bìa & nhận diện',
  about: 'Giới thiệu',
  projects: 'Dự án',
  campaigns: 'Chiến dịch',
  products: 'Sản phẩm',
  blog: 'Blog',
  pledges: 'Đã ủng hộ',
  badges: 'Huy hiệu',
  achievements: 'Thành tích',
  analytics: 'Thống kê nâng cao',
  cta: 'Nút kêu gọi hành động',
};

function groupsFor(audience: ProfileAudience): Array<{ id: StudioGroupId; title: string; hint: string; sortable: boolean }> {
  if (audience === 'owner') {
    return [
      {
        id: 'chrome',
        title: 'Đầu trang',
        hint: 'Ảnh bìa và giới thiệu cố định phía trên.',
        sortable: false,
      },
      {
        id: 'tabs',
        title: 'Thanh tab của chính chủ',
        hint: 'Kéo để đổi thứ tự. Các tab luôn hiện khi bạn vào trang của mình, kể cả khi trống.',
        sortable: true,
      },
      {
        id: 'extra',
        title: 'Khối phụ',
        hint: 'Không nằm trong thanh tab.',
        sortable: true,
      },
    ];
  }
  return [
    {
      id: 'chrome',
      title: 'Đầu trang công khai',
      hint: 'Ảnh bìa và giới thiệu — bật/tắt cho khách.',
      sortable: false,
    },
    {
      id: 'tabs',
      title: 'Thanh tab khách thấy',
      hint: 'Kéo để đổi thứ tự. Tắt ô hiện thì khách không thấy tab đó. Tab trống cũng được ẩn.',
      sortable: true,
    },
    {
      id: 'extra',
      title: 'Khối phụ cho khách',
      hint: 'Không nằm trong thanh tab.',
      sortable: true,
    },
  ];
}

function Row({
  item,
  index,
  items,
  sortable,
  lockVisible,
  dragId,
  setDragId,
  config,
  onChange,
  audience,
}: {
  item: ProfileSection;
  index: number;
  items: ProfileSection[];
  sortable: boolean;
  lockVisible: boolean;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  config: ProfileCustomizationConfig;
  onChange: (next: ProfileCustomizationConfig) => void;
  audience: ProfileAudience;
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
        if (sortable && dragId) onChange(moveStudioSection(config, dragId, item.id, audience));
        setDragId(null);
      }}
      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-cream/70 p-3"
    >
      <GripVertical className={sortable ? 'cursor-grab text-gray-400' : 'text-gray-300'} size={18} />
      <div className="min-w-0 flex-1">
        <div className="font-bold text-dblue">{SECTION_LABELS[item.id]}</div>
        <div className="text-xs text-gray-500">{STUDIO_SECTION_HINTS[item.id as keyof typeof STUDIO_SECTION_HINTS]} · tối đa {item.limit} mục</div>
      </div>
      {sortable && (
        <>
          <button
            type="button"
            aria-label="Đưa lên"
            disabled={index === 0}
            onClick={() => onChange(moveStudioSection(config, item.id, items[index - 1].id, audience))}
            className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            aria-label="Đưa xuống"
            disabled={index === items.length - 1}
            onClick={() => onChange(moveStudioSection(config, item.id, items[index + 1].id, audience))}
            className="rounded-lg p-1 text-gray-500 hover:bg-white disabled:opacity-30"
          >
            <ChevronDown size={16} />
          </button>
        </>
      )}
      <input
        aria-label={`Hiện ${SECTION_LABELS[item.id]}`}
        type="checkbox"
        checked={lockVisible ? true : item.visible}
        disabled={lockVisible}
        onChange={(event) => onChange(setStudioSectionVisible(config, item.id, event.target.checked, audience))}
        className="h-4 w-4 accent-pgreen disabled:opacity-60"
      />
    </div>
  );
}

export default function SectionDragList({
  config,
  onChange,
  audience,
}: {
  config: ProfileCustomizationConfig;
  onChange: (next: ProfileCustomizationConfig) => void;
  audience: ProfileAudience;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const tabSet = new Set(PROFILE_TAB_SECTION_IDS as readonly string[]);

  return (
    <div className="space-y-6">
      {groupsFor(audience).map((group) => {
        const items = orderedGroupSections(config, group.id, audience);
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
                lockVisible={audience === 'owner' && tabSet.has(item.id)}
                dragId={dragId}
                setDragId={setDragId}
                config={config}
                onChange={onChange}
                audience={audience}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
