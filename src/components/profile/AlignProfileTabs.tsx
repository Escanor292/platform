'use client';

import { useEffect } from 'react';
import {
  getOrderedTabSections,
  getPreferredProfileTab,
  PROFILE_TAB_LABELS,
  type ProfileCustomizationConfig,
} from '@/lib/profile-customization';

export default function AlignProfileTabs({ config }: { config: ProfileCustomizationConfig }) {
  const preferred = getPreferredProfileTab(config);
  const orderedLabels = getOrderedTabSections(config)
    .filter((item) => item.visible)
    .map((item) => PROFILE_TAB_LABELS[item.id]);

  useEffect(() => {
    const nav = Array.from(document.querySelectorAll('button')).find((button) => {
      const text = button.textContent || '';
      return orderedLabels.some((label) => text.startsWith(label));
    })?.parentElement;
    if (!nav) return;

    const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button'));
    orderedLabels.forEach((label) => {
      const match = buttons.find((button) => (button.textContent || '').startsWith(label));
      if (match) nav.appendChild(match);
    });

    const currentButtons = Array.from(nav.querySelectorAll<HTMLButtonElement>(':scope > button'));
    const currentActive = currentButtons.find((button) =>
      button.className.includes('from-pgreen') || button.className.includes('shadow-lg'),
    );
    const preferredButton = currentButtons.find((button) =>
      (button.textContent || '').startsWith(PROFILE_TAB_LABELS[preferred]),
    );
    if (preferredButton && currentActive !== preferredButton) preferredButton.click();
  }, [orderedLabels.join('|'), preferred]);

  return null;
}
