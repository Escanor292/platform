export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'github'
  | 'threads'
  | 'telegram'
  | 'discord'
  | 'behance'
  | 'dribbble'
  | 'medium'
  | 'website';

export type SocialLink = {
  url: string;
  platform: SocialPlatform;
  label?: string;
};

export type PlatformConfig = {
  id: SocialPlatform;
  label: string;
  domains: string[];
  color: string;
  iconName: string;
};
