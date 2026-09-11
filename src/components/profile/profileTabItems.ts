import { getOrderedTabSectionsFor, isLayoutSectionVisible, profileAudience, type ProfileCustomizationConfig } from "@/lib/profile-customization";

export type ProfileTabType = "projects" | "campaigns" | "products" | "blog" | "pledges" | "badges";

export type ProfileTabItem = {
  id: ProfileTabType;
  label: string;
  count?: number;
  show: boolean;
};

export function buildProfileTabItems(
  profileConfig: ProfileCustomizationConfig,
  options: {
    isOwnProfile: boolean;
    showAsPublic: boolean;
    isCreator: boolean;
    isBacker: boolean;
    projectCount: number;
    campaignCount: number;
    productCount: number;
    blogCount: number;
    pledgeCount: number;
    badgeCount?: number;
  },
): ProfileTabItem[] {
  const audience = profileAudience(options.isOwnProfile, options.showAsPublic);
  const ownerView = audience === "owner";
  const tabOrder = getOrderedTabSectionsFor(profileConfig, audience).map(item => item.id);
  const items: ProfileTabItem[] = [
    {
      id: "projects",
      label: "Dự án",
      count: options.projectCount,
      show: isLayoutSectionVisible(profileConfig, "projects", audience) && (ownerView || options.projectCount > 0),
    },
    {
      id: "campaigns",
      label: "Chiến dịch",
      count: options.campaignCount,
      show: isLayoutSectionVisible(profileConfig, "campaigns", audience) && (ownerView || options.campaignCount > 0),
    },
    {
      id: "products",
      label: "Sản phẩm",
      count: options.productCount,
      show: isLayoutSectionVisible(profileConfig, "products", audience) && (ownerView || options.productCount > 0),
    },
    {
      id: "blog",
      label: "Blog",
      count: options.blogCount,
      show: isLayoutSectionVisible(profileConfig, "blog", audience) && (ownerView || options.blogCount > 0),
    },
    {
      id: "pledges",
      label: "Đã ủng hộ",
      count: options.pledgeCount,
      show: isLayoutSectionVisible(profileConfig, "pledges", audience) && (ownerView || options.pledgeCount > 0),
    },
    {
      id: "badges",
      label: "Huy hiệu",
      count: options.badgeCount || 0,
      show: isLayoutSectionVisible(profileConfig, "badges", audience) && (ownerView || (options.badgeCount || 0) > 0),
    },
  ];

  return [...items].sort((a, b) => {
    const ai = tabOrder.indexOf(a.id);
    const bi = tabOrder.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}