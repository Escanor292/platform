/**
 * Editor Validation Utilities
 * Validate content, URLs, files, and editor state
 */

import {
  EDITOR_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_DOMAINS,
  URL_REGEX,
  YOUTUBE_REGEX,
  VIMEO_REGEX,
  EMAIL_REGEX,
  ERROR_MESSAGES,
} from './constants';
import { ValidationResult, ContentValidationRules } from '@/types/editor';

// ============================================
// URL VALIDATION
// ============================================

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return URL_REGEX.test(url) && (urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Add https:// if no protocol
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  
  return url;
}

export function getUrlError(url: string): string | null {
  if (!url) return 'URL không được để trống';
  
  const normalized = normalizeUrl(url);
  
  if (!isValidUrl(normalized)) {
    return ERROR_MESSAGES.INVALID_URL;
  }
  
  return null;
}

// ============================================
// VIDEO URL VALIDATION
// ============================================

export function extractYouTubeId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function extractVimeoId(url: string): string | null {
  const match = url.match(VIMEO_REGEX);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url);
}

export function isVimeoUrl(url: string): boolean {
  return VIMEO_REGEX.test(url);
}

export function isValidVideoUrl(url: string): boolean {
  return isYouTubeUrl(url) || isVimeoUrl(url);
}

export function getVideoProvider(url: string): 'youtube' | 'vimeo' | null {
  if (isYouTubeUrl(url)) return 'youtube';
  if (isVimeoUrl(url)) return 'vimeo';
  return null;
}

export function isAllowedVideoDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ALLOWED_VIDEO_DOMAINS.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
}

// ============================================
// FILE VALIDATION
// ============================================

export function isValidImageFile(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.includes(file.type as any);
}

export function isFileSizeValid(file: File, maxSize: number = EDITOR_LIMITS.MAX_IMAGE_SIZE): boolean {
  return file.size <= maxSize;
}

export function getFileValidationError(file: File): string | null {
  if (!isValidImageFile(file)) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE;
  }
  
  if (!isFileSizeValid(file)) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }
  
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// CONTENT VALIDATION
// ============================================

export function validateContent(
  content: string,
  rules: ContentValidationRules = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if required
  if (rules.required && (!content || content.trim() === '' || content === '<p></p>')) {
    errors.push('Nội dung không được để trống');
  }
  
  // Check min length
  if (rules.minLength && content.length < rules.minLength) {
    errors.push(`Nội dung phải có ít nhất ${rules.minLength} ký tự`);
  }
  
  // Check max length
  if (rules.maxLength && content.length > rules.maxLength) {
    errors.push(`Nội dung không được vượt quá ${rules.maxLength} ký tự`);
  }
  
  // Check max images
  if (rules.maxImages) {
    const imageCount = (content.match(/<img/g) || []).length;
    if (imageCount > rules.maxImages) {
      warnings.push(`Nội dung có ${imageCount} ảnh, khuyến nghị tối đa ${rules.maxImages} ảnh`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function isContentEmpty(content: string): boolean {
  if (!content) return true;
  
  // Remove HTML tags and check if there's any text
  const text = content.replace(/<[^>]*>/g, '').trim();
  return text.length === 0;
}

export function getWordCount(content: string): number {
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (!text) return 0;
  
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

export function getCharacterCount(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  return text.length;
}

// ============================================
// SANITIZATION CHECKS
// ============================================

export function containsScriptTags(html: string): boolean {
  return /<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(html);
}

export function containsEventHandlers(html: string): boolean {
  return /on\w+\s*=/gi.test(html);
}

export function containsUnsafeContent(html: string): boolean {
  return containsScriptTags(html) || containsEventHandlers(html);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

export function countImages(html: string): number {
  return (html.match(/<img/g) || []).length;
}
