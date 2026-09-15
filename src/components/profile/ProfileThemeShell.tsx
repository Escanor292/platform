'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  DEFAULT_PROFILE_CUSTOMIZATION,
  getProfileThemeStyle,
  normalizeProfileCustomization,
  resolveProfileTheme,
  type ProfileCustomizationConfig,
} from '@/lib/profile-customization';

function isUserProfileRoute(pathname: string) {
  const match = pathname.match(/^\/profile\/([^/]+)(?:\/|$)/);
  return Boolean(match && match[1] !== 'edit');
}

function getUserId(pathname: string) {
  return pathname.match(/^\/profile\/([^/]+)/)?.[1] ?? null;
}

export default function ProfileThemeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [config, setConfig] = useState<ProfileCustomizationConfig>(DEFAULT_PROFILE_CUSTOMIZATION);
  const isProfile = isUserProfileRoute(pathname);
  const userId = isProfile ? getUserId(pathname) : null;
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    if (!userId) {
      setConfig(DEFAULT_PROFILE_CUSTOMIZATION);
      return;
    }

    let cancelled = false;
    fetch(`/api/profile/customization/public/${encodeURIComponent(userId)}`, { cache: 'no-store' })
      .then(async (response) => response.ok ? response.json() : null)
      .then((body) => {
        if (cancelled || !body?.config) return;
        setConfig(normalizeProfileCustomization({
          ...DEFAULT_PROFILE_CUSTOMIZATION,
          preset: body.config.preset ?? DEFAULT_PROFILE_CUSTOMIZATION.preset,
          theme: { ...DEFAULT_PROFILE_CUSTOMIZATION.theme, ...body.config.theme },
          themeDark: body.config.themeDark,
        }));
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_PROFILE_CUSTOMIZATION);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const active = resolveProfileTheme(config, mode);
  const profileStyle = isProfile ? getProfileThemeStyle(config, mode) : {};
  const shellStyle = isProfile
    ? {
        ...profileStyle,
        '--profile-shell-primary': active.primary,
        '--profile-shell-secondary': active.secondary,
        '--profile-shell-background': active.background,
        '--profile-shell-surface': active.surface,
        '--profile-shell-text': active.text,
        '--profile-shell-muted': active.muted,
      }
    : {};

  return <div style={{ ...(shellStyle as React.CSSProperties), fontFamily: isProfile ? 'var(--profile-font)' : undefined }}>{children}</div>;
}
