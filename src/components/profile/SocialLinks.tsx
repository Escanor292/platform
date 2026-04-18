"use client";

import { SocialLink } from '@/types/social';
import { getPlatformConfig } from '@/lib/social-platforms';
import { 
  Facebook, Instagram, Twitter, Youtube, Linkedin, Github, 
  Send, MessageCircle, Briefcase, Dribbble, BookOpen, 
  Globe, AtSign, Music 
} from 'lucide-react';

const ICON_MAP = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  music: Music,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  'at-sign': AtSign,
  send: Send,
  'message-circle': MessageCircle,
  briefcase: Briefcase,
  dribbble: Dribbble,
  'book-open': BookOpen,
  globe: Globe,
};

interface SocialLinksProps {
  links: SocialLink[];
  size?: 'sm' | 'md' | 'lg';
}

export default function SocialLinks({ links, size = 'md' }: SocialLinksProps) {
  if (!links || links.length === 0) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, index) => {
        const config = getPlatformConfig(link.platform) || getPlatformConfig('website');
        const IconComponent = ICON_MAP[config.iconName as keyof typeof ICON_MAP] || Globe;
        
        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${sizeClasses[size]} rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all hover:scale-110 hover:shadow-md group relative`}
            title={link.label || config.label}
            style={{
              borderColor: config.color + '20',
            }}
          >
            <IconComponent 
              size={iconSizes[size]} 
              style={{ color: config.color }}
              className="transition-transform group-hover:scale-110"
            />
            
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {link.label || config.label}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
