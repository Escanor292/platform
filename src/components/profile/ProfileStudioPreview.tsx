'use client';

import {
  getOrderedTabSections,
  getPreferredProfileTab,
  getProfileThemeStyle,
  isSectionVisible,
  PROFILE_TAB_LABELS,
  type ProfileCustomizationConfig,
} from '@/lib/profile-customization';

type PreviewMode = 'desktop' | 'mobile';

export default function ProfileStudioPreview({
  config,
  mode,
}: {
  config: ProfileCustomizationConfig;
  mode: PreviewMode;
}) {
  const tabs = getOrderedTabSections(config).filter((item) => item.visible);
  const activeTab = tabs.some((item) => item.id === getPreferredProfileTab(config))
    ? getPreferredProfileTab(config)
    : tabs[0]?.id;
  const radius = config.theme.radius === 'pill' ? '999px' : config.theme.radius === 'soft' ? '1rem' : '1.75rem';

  return (
    <div
      className={`overflow-hidden border border-[color:var(--profile-primary)]/15 bg-[var(--profile-background)] text-[var(--profile-text)] ${mode === 'mobile' ? 'mx-auto max-w-[360px]' : 'w-full'}`}
      style={{ ...getProfileThemeStyle(config), borderRadius: radius }}
    >
      <div className="overflow-hidden bg-[var(--profile-surface)]" style={{ borderRadius: radius }}>
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
          <div className="flex flex-wrap gap-2 rounded-2xl border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-2">
            {tabs.map((tab) => (
              <span
                key={tab.id}
                className="rounded-xl px-3 py-1.5 text-[11px] font-bold"
                style={
                  tab.id === activeTab
                    ? { background: 'var(--profile-primary)', color: 'var(--profile-contrast)' }
                    : { color: 'var(--profile-muted)', border: '1px solid color-mix(in srgb, var(--profile-primary) 18%, transparent)' }
                }
              >
                {PROFILE_TAB_LABELS[tab.id]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="rounded-2xl border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3.5 w-32 rounded-full" style={{ background: 'var(--profile-primary)' }} />
            <span className="text-[11px] text-[var(--profile-muted)]">
              {activeTab ? PROFILE_TAB_LABELS[activeTab] : 'Nội dung'}
            </span>
          </div>
          <div className={`grid gap-2 ${mode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {[1, 2].map((item) => (
              <div key={item} className="h-16 rounded-xl bg-[var(--profile-background)]" />
            ))}
          </div>
        </div>
        {isSectionVisible(config, 'cta') && config.cta.enabled && (
          <div className="mt-3 rounded-xl p-3 text-center text-sm font-bold" style={{ background: 'var(--profile-primary)', color: 'var(--profile-contrast)' }}>
            {config.cta.label}
          </div>
        )}
      </div>
    </div>
  );
}
