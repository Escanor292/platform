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

function PreviewHeader({ mode }: { mode: PreviewMode }) {
  return (
    <div
      className="flex items-center justify-between gap-2 border-b px-3 py-2"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--profile-primary) 8%, var(--profile-surface) 92%)',
        borderColor: 'color-mix(in srgb, var(--profile-primary) 18%, transparent)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md" style={{ background: 'var(--profile-gradient)' }} />
        <span className="text-[11px] font-black" style={{ color: 'var(--profile-text)' }}>TửTế Fund</span>
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
    <div className="px-3 py-3 text-[10px]" style={{ background: 'var(--profile-primary)', color: 'var(--profile-contrast)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-black">TửTế Fund</span>
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
  const radius = config.theme.radius === 'pill' ? '999px' : config.theme.radius === 'soft' ? '1rem' : '1.75rem';
  const title = currentTab ? PROFILE_TAB_LABELS[currentTab] : 'Nội dung';
  const themeStyle = {
    ...getProfileThemeStyle(config),
    '--profile-shell-primary': config.theme.primary,
    '--profile-shell-secondary': config.theme.secondary,
    '--profile-shell-background': config.theme.background,
    '--profile-shell-surface': config.theme.surface,
    '--profile-shell-text': config.theme.text,
    '--profile-shell-muted': config.theme.muted,
  } as React.CSSProperties;

  return (
    <div
      className={`overflow-hidden border border-[color:var(--profile-primary)]/15 bg-[var(--profile-background)] text-[var(--profile-text)] ${mode === 'mobile' ? 'mx-auto max-w-[360px]' : 'w-full'}`}
      style={{ ...themeStyle, borderRadius: radius }}
    >
      <PreviewHeader mode={mode} />

      <div className="overflow-hidden bg-[var(--profile-surface)]">
        {isSectionVisible(config, 'hero') && (
          <div className="relative h-28" style={{ background: 'var(--profile-gradient)' }}>
            <div className="absolute -bottom-6 left-4 h-12 w-12 rounded-2xl border-4 border-[var(--profile-surface)] bg-[var(--profile-primary)]" />
          </div>
        )}
        <div className={`px-4 ${isSectionVisible(config, 'hero') ? 'pt-8' : 'pt-4'} pb-4`}>
          <div className="h-4 w-40 rounded-full bg-[var(--profile-text)]/80" />
          {isSectionVisible(config, 'about') && (
            <div className="mt-3 rounded-xl bg-[var(--profile-background)] px-3 py-2 text-[11px] text-[var(--profile-muted)]">
              Giới thiệu bản thân và liên kết xã hội
            </div>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="px-3 pt-3">
          <div
            className="flex flex-wrap gap-2 border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-2"
            style={{ borderRadius: 'var(--profile-radius)' }}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === currentTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="rounded-[1.5rem] px-4 py-2 text-[11px] font-bold transition"
                  style={
                    isActive
                      ? { background: 'var(--profile-primary)', color: 'var(--profile-contrast)' }
                      : { color: 'var(--profile-muted)', border: '1px solid color-mix(in srgb, var(--profile-primary) 18%, transparent)', background: 'var(--profile-surface)' }
                  }
                >
                  {PROFILE_TAB_LABELS[tab.id]}
                  {TAB_COUNTS[tab.id] ? ` (${TAB_COUNTS[tab.id]})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-3">
        <div
          className="border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-4"
          style={{ borderRadius: 'var(--profile-radius)' }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-sm font-black">{title} đã tạo</div>
            <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: 'var(--profile-primary)', color: 'var(--profile-contrast)' }}>
              + Tạo
            </span>
          </div>
          <div className={`grid gap-3 ${mode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {[1, 2].map((item) => (
              <div key={item} className="rounded-2xl bg-[var(--profile-background)] p-3">
                <div className="mb-6 flex gap-1">
                  <span className="h-4 w-12 rounded-md" style={{ background: 'var(--profile-primary)' }} />
                  <span className="h-4 w-16 rounded-md bg-[var(--profile-surface)]" />
                </div>
                <div className="h-3 w-3/4 rounded-full bg-[var(--profile-text)]/70" />
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
