"use client";

import { useState } from 'react';
import { SocialLink } from '@/types/social';
import { 
  normalizeUrl, 
  isValidUrl, 
  detectPlatform, 
  getPlatformConfig,
  extractDomain 
} from '@/lib/social-platforms';
import { Plus, X, AlertCircle, ExternalLink } from 'lucide-react';
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

interface SocialLinksEditorProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export default function SocialLinksEditor({ value, onChange }: SocialLinksEditorProps) {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newUrl.trim()) {
      setError('Vui lòng nhập URL');
      return;
    }

    const normalized = normalizeUrl(newUrl);
    
    if (!isValidUrl(normalized)) {
      setError('URL không hợp lệ');
      return;
    }

    // Check duplicate
    if (value.some(link => link.url === normalized)) {
      setError('Link này đã tồn tại');
      return;
    }

    const platform = detectPlatform(normalized);
    const config = getPlatformConfig(platform);

    const newLink: SocialLink = {
      url: normalized,
      platform,
      label: config.label,
    };

    onChange([...value, newLink]);
    setNewUrl('');
    setError('');
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Real-time preview
  const previewPlatform = newUrl.trim() ? detectPlatform(newUrl) : null;
  const previewConfig = previewPlatform ? getPlatformConfig(previewPlatform) : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Liên kết mạng xã hội
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Thêm link Facebook, Instagram, Twitter, GitHub, v.v.
        </p>

        {/* Input with preview */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="https://facebook.com/yourname"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              
              {/* Real-time platform preview */}
              {previewConfig && newUrl.trim() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {(() => {
                    const IconComponent = ICON_MAP[previewConfig.iconName as keyof typeof ICON_MAP] || Globe;
                    return (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                        <IconComponent size={14} style={{ color: previewConfig.color }} />
                        <span className="text-xs font-medium text-gray-600">
                          {previewConfig.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleAdd}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 font-medium text-sm"
            >
              <Plus size={16} />
              Thêm
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Links list */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Đã thêm ({value.length})
          </div>
          <div className="space-y-2">
            {value.map((link, index) => {
              const config = getPlatformConfig(link.platform);
              const IconComponent = ICON_MAP[config.iconName as keyof typeof ICON_MAP] || Globe;
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 group hover:bg-gray-100 transition"
                >
                  {/* Icon */}
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: config.color + '15' }}
                  >
                    <IconComponent size={18} style={{ color: config.color }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900">
                      {config.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {extractDomain(link.url)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 transition"
                      title="Xem link"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Xóa"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Globe className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm text-gray-500">Chưa có liên kết nào</p>
          <p className="text-xs text-gray-400 mt-1">Thêm link mạng xã hội của bạn</p>
        </div>
      )}
    </div>
  );
}
