'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_PROFILE_CUSTOMIZATION, getProfileThemeStyle, normalizeProfileCustomization, type ProfileCustomizationConfig } from '@/lib/profile-customization';

function isUserProfileRoute(pathname: string) {
  const match = pathname.match(/^\/profile\/([^/]+)(?:\/|$)/);
  // `/profile/edit` is the legacy global editor; `/profile/:userId/*` is owner/public profile scope.
  return Boolean(match && match[1] !== 'edit');
}

function getUserId(pathname: string) {
  return pathname.match(/^\/profile\/([^/]+)/)?.[1] ?? null;
}

export default function ProfileThemeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [config, setConfig] = useState<ProfileCustomizationConfig>(DEFAULT_PROFILE_CUSTOMIZATION);
  const isProfile = isUserProfileRoute(pathname);
  const userId = isProfile ? getUserId(pathname) : null;

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
        setConfig(normalizeProfileCustomization(body.config));
      })
      .catch(() => {
        // The shell must always fall back to the platform theme instead of breaking navigation.
        if (!cancelled) setConfig(DEFAULT_PROFILE_CUSTOMIZATION);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profileStyle = isProfile ? getProfileThemeStyle(config) : {};
  const shellStyle = isProfile
    ? {
        ...profileStyle,
        '--profile-shell-primary': config.theme.primary,
        '--profile-shell-secondary': config.theme.secondary,
        '--profile-shell-background': config.theme.background,
        '--profile-shell-surface': config.theme.surface,
        '--profile-shell-text': config.theme.text,
        '--profile-shell-muted': config.theme.muted,
      }
    : {};

  return <div style={shellStyle as React.CSSProperties}>{children}</div>;
}
