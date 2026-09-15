import {
  applyPresetLayout,
  applyShareableTemplate,
  DEFAULT_PROFILE_CUSTOMIZATION,
  getOrderedSections,
  getOrderedTabSections,
  getOrderedTabSectionsFor,
  getPreferredProfileTab,
  getPublicProfileCustomization,
  isLayoutSectionVisible,
  normalizeProfileCustomization,
  parseProfileCustomization,
  PROFILE_SECTION_IDS,
  suggestDarkProfileTheme,
  themeFitsDarkMode,
  resolveProfileTheme,
  toShareableTemplate,
} from '@/lib/profile-customization';

describe('profile customization contract', () => {
  it('returns a complete safe default for malformed input', () => {
    const config = normalizeProfileCustomization({
      preset: 'unknown',
      theme: { primary: 'javascript:alert(1)' },
    });

    expect(config).toEqual(DEFAULT_PROFILE_CUSTOMIZATION);
    expect(config.sections).toHaveLength(PROFILE_SECTION_IDS.length);
  });

  it('accepts only bounded color and layout values', () => {
    const result = parseProfileCustomization({
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      theme: { ...DEFAULT_PROFILE_CUSTOMIZATION.theme, primary: '#123456' },
    });

    expect(result.success).toBe(true);
    expect(parseProfileCustomization({
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      theme: { ...DEFAULT_PROFILE_CUSTOMIZATION.theme, primary: 'red' },
    }).success).toBe(false);
  });

  it('orders sections by the persisted order field', () => {
    const config = normalizeProfileCustomization({
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      sections: DEFAULT_PROFILE_CUSTOMIZATION.sections.map((section) =>
        section.id === 'projects' ? { ...section, order: 19 } : section.id === 'hero' ? { ...section, order: 20 } : section,
      ),
    });

    expect(getOrderedSections(config).map((section) => section.id).slice(-2)).toEqual(['projects', 'hero']);
  });

  it('keeps A/B assignment deterministic for the same public user', () => {
    const config = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      experiment: { enabled: true, variantBPreset: 'shop' as const, allocationPercent: 100 },
    };

    const first = getPublicProfileCustomization(config, 'user-a');
    const second = getPublicProfileCustomization(config, 'user-a');

    expect(first).toEqual(second);
    expect(first.preset).toBe('shop');
    expect(first.theme.primary).toBe('#ea580c');
  });

  it('shop preset puts products before campaigns like the live tab bar', () => {
    const shop = applyPresetLayout(DEFAULT_PROFILE_CUSTOMIZATION, 'shop');
    expect(getOrderedTabSections(shop).filter((section) => section.visible).map((section) => section.id)).toEqual([
      'products',
      'campaigns',
    ]);
    expect(getPreferredProfileTab(shop)).toBe('products');
  });

  it('keeps live tab order from a shop draft that only toggled visibility', () => {
    const staleShop = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      preset: 'shop' as const,
      sections: DEFAULT_PROFILE_CUSTOMIZATION.sections.map((section) => ({
        ...section,
        visible: ['hero', 'about', 'products', 'campaigns', 'pledges', 'cta'].includes(section.id),
      })),
    };

    expect(getPreferredProfileTab(staleShop)).toBe('products');
    expect(getOrderedTabSections(staleShop).filter((section) => section.visible).map((section) => section.id)[0]).toBe('products');
  });

  it('strips featured content and disables A/B from a shared template', () => {
    const source = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      theme: { ...DEFAULT_PROFILE_CUSTOMIZATION.theme, primary: '#123456' },
      featured: {
        projectIds: ['clh3x0k2n0000qz8k9v0q1w2x'],
        campaignIds: ['clh3x0k2n0000qz8k9v0q1w2y'],
        rewardIds: ['steal-me'],
        blogPostIds: ['clh3x0k2n0000qz8k9v0q1w2z'],
      },
      experiment: { enabled: true, variantBPreset: 'shop' as const, allocationPercent: 40 },
    };

    const shared = toShareableTemplate(source);
    expect(shared.theme.primary).toBe('#123456');
    expect(shared.featured).toEqual({ projectIds: [], campaignIds: [], rewardIds: [], blogPostIds: [] });
    expect(shared.experiment).toEqual({ enabled: false, variantBPreset: 'shop', allocationPercent: 0 });
  });

  it('applies a shared template without overwriting the owner featured block', () => {
    const current = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      featured: {
        projectIds: ['clh3x0k2n0000qz8k9v0q1w2x'],
        campaignIds: ['clh3x0k2n0000qz8k9v0q1w2y'],
        rewardIds: ['keep-me'],
        blogPostIds: [],
      },
      experiment: { enabled: true, variantBPreset: 'shop' as const, allocationPercent: 30 },
    };
    const template = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      theme: { ...DEFAULT_PROFILE_CUSTOMIZATION.theme, primary: '#abcdef' },
      featured: {
        projectIds: ['clzzzzzzzzzzzzzzzzzzzzzzz'],
        campaignIds: [],
        rewardIds: ['steal'],
        blogPostIds: ['clh3x0k2n0000qz8k9v0q1w2z'],
      },
      experiment: { enabled: true, variantBPreset: 'community' as const, allocationPercent: 90 },
    };

    const next = applyShareableTemplate(current, template);
    expect(next.theme.primary).toBe('#abcdef');
    expect(next.featured).toEqual(current.featured);
    expect(next.experiment).toEqual(current.experiment);
  });

  it('fills owner layout for legacy configs and keeps owner tabs independent of guest hides', () => {
    const { ownerSections: _ignored, ...legacy } = DEFAULT_PROFILE_CUSTOMIZATION;
    const config = normalizeProfileCustomization({
      ...legacy,
      sections: DEFAULT_PROFILE_CUSTOMIZATION.sections.map((section) =>
        ['projects', 'campaigns', 'products'].includes(section.id) ? { ...section, visible: false } : section,
      ),
    });

    expect(config.ownerSections).toHaveLength(PROFILE_SECTION_IDS.length);
    expect(isLayoutSectionVisible(config, 'projects', 'guest')).toBe(false);
    expect(isLayoutSectionVisible(config, 'projects', 'owner')).toBe(true);
    expect(getOrderedTabSectionsFor(config, 'owner').map((section) => section.id)).toEqual(
      expect.arrayContaining(['projects', 'campaigns', 'products', 'blog', 'pledges', 'badges']),
    );
  });

  it('keeps pledges off for guests by default and on for the owner', () => {
    const config = DEFAULT_PROFILE_CUSTOMIZATION;
    expect(isLayoutSectionVisible(config, 'pledges', 'guest')).toBe(false);
    expect(isLayoutSectionVisible(config, 'pledges', 'owner')).toBe(true);
    expect(isLayoutSectionVisible(config, 'badges', 'guest')).toBe(true);
  });

  it('lets the owner hide a tab without changing the guest layout', () => {
    const hidden = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      ownerSections: DEFAULT_PROFILE_CUSTOMIZATION.ownerSections.map((section) =>
        section.id === 'blog' ? { ...section, visible: false } : section,
      ),
    };
    expect(isLayoutSectionVisible(hidden, 'blog', 'owner')).toBe(false);
    expect(isLayoutSectionVisible(hidden, 'blog', 'guest')).toBe(true);
  });

  it('keeps the owner layout when applying a shared template', () => {
    const current = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      ownerSections: DEFAULT_PROFILE_CUSTOMIZATION.ownerSections.map((section) =>
        section.id === 'blog' ? { ...section, order: 0 } : section,
      ),
    };
    const template = {
      ...DEFAULT_PROFILE_CUSTOMIZATION,
      theme: { ...DEFAULT_PROFILE_CUSTOMIZATION.theme, primary: '#123456' },
    };

    const next = applyShareableTemplate(current, template);
    expect(next.theme.primary).toBe('#123456');
    expect(next.ownerSections).toEqual(current.ownerSections);
  });

  it('flags a light cream profile as unfit for platform dark mode', () => {
    expect(themeFitsDarkMode(DEFAULT_PROFILE_CUSTOMIZATION.theme)).toBe(false);
  });

  it('suggests a darker sibling that keeps hue and readable type', () => {
    const dark = suggestDarkProfileTheme(DEFAULT_PROFILE_CUSTOMIZATION.theme);
    expect(themeFitsDarkMode(dark)).toBe(true);
    expect(dark.primary.startsWith('#')).toBe(true);
    expect(dark.background.toLowerCase()).not.toBe(DEFAULT_PROFILE_CUSTOMIZATION.theme.background.toLowerCase());
  });

  it('uses saved themeDark when the platform is dark, otherwise auto-suggests', () => {
    const customDark = suggestDarkProfileTheme({
      ...DEFAULT_PROFILE_CUSTOMIZATION.theme,
      primary: '#7c3aed',
    });
    const withSaved = { ...DEFAULT_PROFILE_CUSTOMIZATION, themeDark: customDark };
    expect(resolveProfileTheme(withSaved, 'light').primary).toBe(DEFAULT_PROFILE_CUSTOMIZATION.theme.primary);
    expect(resolveProfileTheme(withSaved, 'dark').primary).toBe(customDark.primary);
    expect(resolveProfileTheme(DEFAULT_PROFILE_CUSTOMIZATION, 'dark').background).not.toBe(
      DEFAULT_PROFILE_CUSTOMIZATION.theme.background,
    );
  });

  it('keeps a valid dark theme as-is when already compatible', () => {
    const dark = suggestDarkProfileTheme(DEFAULT_PROFILE_CUSTOMIZATION.theme);
    const config = { ...DEFAULT_PROFILE_CUSTOMIZATION, theme: dark };
    expect(resolveProfileTheme(config, 'dark')).toEqual(dark);
  });
});
