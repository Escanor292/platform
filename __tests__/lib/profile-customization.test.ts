import {
  applyPresetLayout,
  applyShareableTemplate,
  DEFAULT_PROFILE_CUSTOMIZATION,
  getOrderedSections,
  getOrderedTabSections,
  getPreferredProfileTab,
  getPublicProfileCustomization,
  normalizeProfileCustomization,
  parseProfileCustomization,
  PROFILE_SECTION_IDS,
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
      'pledges',
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
});
