import { SocialPlatform, PlatformConfig } from '@/types/social';

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    domains: ['facebook.com', 'fb.com', 'fb.me'],
    color: '#1877F2',
    iconName: 'facebook',
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    domains: ['instagram.com', 'instagr.am'],
    color: '#E4405F',
    iconName: 'instagram',
  },
  x: {
    id: 'x',
    label: 'X (Twitter)',
    domains: ['twitter.com', 'x.com', 't.co'],
    color: '#000000',
    iconName: 'twitter',
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok',
    domains: ['tiktok.com', 'vm.tiktok.com'],
    color: '#000000',
    iconName: 'music',
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    domains: ['youtube.com', 'youtu.be'],
    color: '#FF0000',
    iconName: 'youtube',
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    domains: ['linkedin.com', 'lnkd.in'],
    color: '#0A66C2',
    iconName: 'linkedin',
  },
  github: {
    id: 'github',
    label: 'GitHub',
    domains: ['github.com', 'github.io'],
    color: '#181717',
    iconName: 'github',
  },
  threads: {
    id: 'threads',
    label: 'Threads',
    domains: ['threads.net'],
    color: '#000000',
    iconName: 'at-sign',
  },
  telegram: {
    id: 'telegram',
    label: 'Telegram',
    domains: ['t.me', 'telegram.me', 'telegram.org'],
    color: '#26A5E4',
    iconName: 'send',
  },
  discord: {
    id: 'discord',
    label: 'Discord',
    domains: ['discord.gg', 'discord.com', 'discordapp.com'],
    color: '#5865F2',
    iconName: 'message-circle',
  },
  behance: {
    id: 'behance',
    label: 'Behance',
    domains: ['behance.net'],
    color: '#1769FF',
    iconName: 'briefcase',
  },
  dribbble: {
    id: 'dribbble',
    label: 'Dribbble',
    domains: ['dribbble.com'],
    color: '#EA4C89',
    iconName: 'dribbble',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    domains: ['medium.com'],
    color: '#000000',
    iconName: 'book-open',
  },
  website: {
    id: 'website',
    label: 'Website',
    domains: [],
    color: '#6B7280',
    iconName: 'globe',
  },
};

/**
 * Normalize URL - ensure it has protocol
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // Add https://
  return `https://${trimmed}`;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): SocialPlatform {
  if (!url) return 'website';
  
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    
    // Check each platform's domains
    for (const [platformId, config] of Object.entries(PLATFORM_CONFIGS)) {
      if (platformId === 'website') continue;
      
      for (const domain of config.domains) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return platformId as SocialPlatform;
        }
      }
    }
    
    return 'website';
  } catch {
    return 'website';
  }
}

/**
 * Get platform config
 */
export function getPlatformConfig(platform: SocialPlatform): PlatformConfig {
  return PLATFORM_CONFIGS[platform];
}

/**
 * Extract domain from URL for display
 */
export function extractDomain(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
