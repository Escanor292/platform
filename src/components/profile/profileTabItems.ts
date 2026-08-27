import { getOrderedTabSections, isSectionVisible, type ProfileCustomizationConfig } from "@/lib/profile-customization";

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
  },
): ProfileTabItem[] {
  const tabOrder = getOrderedTabSections(profileConfig).map(item => item.id);
  const items: ProfileTabItem[] = [
    {
      id: "projects",
      label: "Dự án",
      count: options.projectCount,
      show: isSectionVisible(profileConfig, "projects") && ((options.isOwnProfile && !options.showAsPublic) || options.projectCount > 0),
    },
    {
      id: "campaigns",
      label: "Chiến dịch",
      count: options.campaignCount,
      show: isSectionVisible(profileConfig, "campaigns") && ((options.isOwnProfile && !options.showAsPublic) || (options.isCreator && options.campaignCount > 0)),
    },
    {
      id: "products",
      label: "Sản phẩm",
      count: options.productCount,
      show: isSectionVisible(profileConfig, "products") && ((options.isOwnProfile && !options.showAsPublic) || options.productCount > 0),
    },
    {
      id: "blog",
      label: "Blog",
      count: options.blogCount,
      show: isSectionVisible(profileConfig, "blog") && ((options.isOwnProfile && !options.showAsPublic) || options.blogCount > 0),
    },
    {
      id: "pledges",
      label: "Đã ủng hộ",
      count: options.pledgeCount,
      show: isSectionVisible(profileConfig, "pledges") && options.isBacker && options.pledgeCount > 0 && options.isOwnProfile && !options.showAsPublic,
    },
    {
      id: "badges",
      label: "Huy hiệu",
      show: isSectionVisible(profileConfig, "badges"),
    },
  ];

  return [...items].sort((a, b) => {
    const ai = tabOrder.indexOf(a.id);
    const bi = tabOrder.indexOf(b.id);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
