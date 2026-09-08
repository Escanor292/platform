'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getOrderedTabSections,
  getPreferredProfileTab,
  getProfileThemeStyle,
  isSectionVisible,
  PROFILE_TAB_LABELS,
  type ProfileCustomizationConfig,
  type ProfileTabSectionId,
} from '@/lib/profile-customization';

type PreviewMode = 'desktop' | 'mobile';

const TAB_COUNTS: Record<ProfileTabSectionId, string> = {
  projects: '3',
  campaigns: '6',
  products: '8',
  blog: '5',
  pledges: '4',
  badges: '',
};

const CARD_SAMPLES: Record<ProfileTabSectionId, [string, string]> = {
  projects: ['Dự án xanh', 'Hành trình cộng đồng'],
  campaigns: ['Gây quỹ học bổng', 'Chiến dịch mùa hè'],
  products: ['Ấn phẩm đặc biệt', 'Quà cảm ơn'],
  blog: ['Nhật ký tuần này', 'Câu chuyện tử tế'],
  pledges: ['Ủng hộ dự án A', 'Ủng hộ chiến dịch B'],
  badges: ['Huy hiệu tiên phong', 'Huy hiệu đồng hành'],
};

function PreviewHeader({ mode }: { mode: PreviewMode }) {
  return (
    <div
      className="flex items-center justify-between gap-2 border-b px-3 py-2"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--profile-primary) 8%, var(--profile-surface) 92%)',
        borderColor: 'color-mix(in srgb, var(--profile-primary) 18%, transparent)',
        fontFamily: 'var(--profile-font)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md" style={{ background: 'var(--profile-gradient)' }} />
        <span className="text-[11px] font-black" style={{ color: 'var(--profile-text)', fontFamily: 'var(--profile-font-display)' }}>TửTế Fund</span>
      </div>
      {mode === 'desktop' && (
        <div className="flex min-w-0 flex-1 justify-center gap-3 text-[10px] font-semibold" style={{ color: 'var(--profile-muted)' }}>
          <span>Trang chủ</span>
          <span>Giới thiệu</span>
          <span>Khám phá</span>
          <span>Blog</span>
        </div>
      )}
      <span
        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
        style={{ background: 'var(--profile-gradient)', color: 'var(--profile-contrast)' }}
      >
        Gây quỹ ngay
      </span>
    </div>
  );
}

function PreviewFooter() {
  return (
    <div className="px-3 py-3 text-[10px]" style={{ background: 'var(--profile-primary)', color: 'var(--profile-contrast)', fontFamily: 'var(--profile-font)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-black" style={{ fontFamily: 'var(--profile-font-display)' }}>TửTế Fund</span>
        <span className="opacity-70">Chiến dịch · Giới thiệu · Tra cứu</span>
      </div>
      <div
        className="mt-2 border-t pt-2 text-center opacity-50"
        style={{ borderColor: 'color-mix(in srgb, var(--profile-contrast) 22%, transparent)' }}
      >
        © TửTế Fund
      </div>
    </div>
  );
}

export default function ProfileStudioPreview({
  config,
  mode,
}: {
  config: ProfileCustomizationConfig;
  mode: PreviewMode;
}) {
  const tabs = useMemo(
    () => getOrderedTabSections(config).filter((item) => item.visible),
    [config],
  );
  const preferred = getPreferredProfileTab(config);
  const [activeTab, setActiveTab] = useState<ProfileTabSectionId>(preferred);
  useEffect(() => {
    setActiveTab(preferred);
  }, [preferred]);
  const currentTab = tabs.some((item) => item.id === activeTab) ? activeTab : preferred;
  const title = currentTab ? PROFILE_TAB_LABELS[currentTab] : 'Nội dung';
  const samples = currentTab ? CARD_SAMPLES[currentTab] : CARD_SAMPLES.blog;
  const heroHeight = config.theme.heroStyle === 'minimal' ? '2.5rem' : config.theme.heroStyle === 'gradient' ? '5rem' : '7rem';
  const themeStyle = {
    ...getProfileThemeStyle(config),
    '--profile-shell-primary': config.theme.primary,
    '--profile-shell-secondary': config.theme.secondary,
    '--profile-shell-background': config.theme.background,
    '--profile-shell-surface': config.theme.surface,
    '--profile-shell-text': config.theme.text,
    '--profile-shell-muted': config.theme.muted,
    transition: config.theme.reducedMotion ? 'none' : undefined,
  } as React.CSSProperties;

  return (
    <div
      className={`overflow-hidden bg-[var(--profile-background)] text-[var(--profile-text)] ${mode === 'mobile' ? 'mx-auto max-w-[360px]' : 'w-full'}`}
      style={{
        ...themeStyle,
        borderRadius: 'var(--profile-radius)',
        fontFamily: 'var(--profile-font)',
        boxShadow: 'var(--profile-card-shadow)',
        border: 'var(--profile-card-border)',
      }}
    >
      <PreviewHeader mode={mode} />

      <div className="overflow-hidden bg-[var(--profile-surface)]">
        {isSectionVisible(config, 'hero') && (
          <div
            className="relative"
            style={{
              height: heroHeight,
              background: config.theme.heroStyle === 'minimal' ? 'var(--profile-primary)' : 'var(--profile-gradient)',
            }}
          >
            <div
              className="absolute -bottom-6 left-4 h-12 w-12 border-4 border-[var(--profile-surface)]"
              style={{ background: 'var(--profile-primary)', borderRadius: config.theme.radius === 'pill' ? '999px' : '1rem' }}
            />
          </div>
        )}
        <div className="px-4 pb-4" style={{ paddingTop: isSectionVisible(config, 'hero') ? '2rem' : '1rem' }}>
          <div className="text-base font-black" style={{ color: 'var(--profile-text)', fontFamily: 'var(--profile-font-display)' }}>
            Tên hiển thị
          </div>
          {isSectionVisible(config, 'about') && (
            <div
              className="mt-3 text-[11px] leading-relaxed"
              style={{
                color: 'var(--profile-muted)',
                background: 'var(--profile-background)',
                borderRadius: 'var(--profile-radius)',
                padding: 'var(--profile-pad)',
              }}
            >
              Giới thiệu bản thân bằng font {config.theme.fontPreset === 'serif' ? 'thanh lịch' : config.theme.fontPreset === 'friendly' ? 'thân thiện' : 'hiện đại'}.
            </div>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="px-3 pt-3">
          <div
            className="flex flex-wrap bg-[var(--profile-surface)]"
            style={{
              borderRadius: 'var(--profile-radius)',
              border: 'var(--profile-card-border)',
              boxShadow: config.theme.cardStyle === 'elevated' ? 'var(--profile-card-shadow)' : 'none',
              gap: 'var(--profile-gap)',
              padding: 'var(--profile-pad)',
            }}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === currentTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 text-[11px] font-bold"
                  style={{
                    borderRadius: 'var(--profile-radius)',
                    fontFamily: 'var(--profile-font)',
                    ...(isActive
                      ? { background: 'var(--profile-primary)', color: 'var(--profile-contrast)' }
                      : { color: 'var(--profile-muted)', border: '1px solid color-mix(in srgb, var(--profile-primary) 18%, transparent)', background: 'var(--profile-surface)' }),
                  }}
                >
                  {PROFILE_TAB_LABELS[tab.id]}
                  {TAB_COUNTS[tab.id] ? ` (${TAB_COUNTS[tab.id]})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: 'var(--profile-pad)' }}>
        <div
          className="bg-[var(--profile-surface)]"
          style={{
            borderRadius: 'var(--profile-radius)',
            border: 'var(--profile-card-border)',
            boxShadow: 'var(--profile-card-shadow)',
            padding: 'var(--profile-pad)',
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm font-black" style={{ fontFamily: 'var(--profile-font-display)' }}>{title} đã tạo</div>
            <span className="px-3 py-1 text-[10px] font-bold" style={{ background: 'var(--profile-primary)', color: 'var(--profile-contrast)', borderRadius: 'var(--profile-radius)' }}>
              + Tạo
            </span>
          </div>
          <div className={`grid ${mode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`} style={{ gap: 'var(--profile-gap)' }}>
            {samples.map((label) => (
              <div
                key={label}
                className="bg-[var(--profile-background)]"
                style={{
                  borderRadius: 'var(--profile-radius)',
                  border: config.theme.cardStyle === 'bordered' ? 'var(--profile-card-border)' : '0px solid transparent',
                  boxShadow: config.theme.cardStyle === 'elevated' ? 'var(--profile-card-shadow)' : 'none',
                  padding: 'var(--profile-pad)',
                }}
              >
                <div className="mb-2 text-[11px] font-black" style={{ color: 'var(--profile-primary)', fontFamily: 'var(--profile-font-display)' }}>
                  {label}
                </div>
                <div className="text-[10px] leading-relaxed" style={{ color: 'var(--profile-muted)' }}>
                  Mẫu nội dung để xem font, màu chữ phụ và mật độ.
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--profile-surface)]">
                  <div className="h-full w-2/3 rounded-full" style={{ background: 'var(--profile-primary)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PreviewFooter />
    </div>
  );
}
