/**
 * Editor Constants
 * Centralized configuration for the rich text editor
 */

import { CalloutVariant } from '@/types/editor';

export const EDITOR_LIMITS = {
  MAX_CONTENT_LENGTH: 50000,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  MAX_IMAGES_PER_DOCUMENT: 50,
  AUTOSAVE_DELAY: 2000,
  DEBOUNCE_DELAY: 300,
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export const ALLOWED_VIDEO_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
] as const;

export const ALLOWED_HTML_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'strike', 'del', 'code',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre',
  'a', 'img', 'iframe',
  'div', 'span', 'mark',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'figcaption', 'figure',
] as const;

export const ALLOWED_HTML_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'data-alignment', 'data-caption'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'data-provider'],
  div: ['class', 'data-type', 'data-variant', 'data-payload', 'data-slot', 'data-src', 'data-provider', 'data-width', 'data-height', 'data-reward-id', 'data-title', 'data-price', 'data-image-url', 'data-link-url', 'data-campaign-id', 'data-is-preorder', 'data-delivery-date'],
  span: ['class'],
  mark: ['class'],
  code: ['class'],
  pre: ['class'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan'],
  li: ['data-type', 'data-checked'],
  ul: ['data-type'],
};

export const ALLOWED_URL_SCHEMES = ['http', 'https', 'mailto'] as const;

export const CALLOUT_STYLES: Record<CalloutVariant, {
  container: string;
  icon: string;
  iconColor: string;
}> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: 'ℹ️',
    iconColor: 'text-blue-600',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: '⚠️',
    iconColor: 'text-amber-600',
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: '✓',
    iconColor: 'text-emerald-600',
  },
  danger: {
    container: 'bg-red-50 border-red-200 text-red-900',
    icon: '⚠',
    iconColor: 'text-red-600',
  },
};

export const KEYBOARD_SHORTCUTS = {
  BOLD: 'Mod-b',
  ITALIC: 'Mod-i',
  UNDERLINE: 'Mod-u',
  STRIKE: 'Mod-Shift-x',
  CODE: 'Mod-e',
  LINK: 'Mod-k',
  BULLET_LIST: 'Mod-Shift-8',
  ORDERED_LIST: 'Mod-Shift-7',
  TASK_LIST: 'Mod-Shift-9',
  BLOCKQUOTE: 'Mod-Shift-b',
  CODE_BLOCK: 'Mod-Alt-c',
  HEADING_1: 'Mod-Alt-1',
  HEADING_2: 'Mod-Alt-2',
  HEADING_3: 'Mod-Alt-3',
  UNDO: 'Mod-z',
  REDO: 'Mod-Shift-z',
  HARD_BREAK: 'Shift-Enter',
} as const;

export const EDITOR_PLACEHOLDERS = {
  CAMPAIGN_DESCRIPTION: 'Hãy kể câu chuyện chiến dịch của bạn... Người ủng hộ muốn biết dự án này về điều gì, tại sao nó quan trọng, và bạn sẽ sử dụng nguồn vốn như thế nào.',
  UPDATE_POST: 'Chia sẻ tiến độ mới nhất của chiến dịch...',
  FAQ: 'Nhập câu trả lời cho câu hỏi này...',
  REWARD_DESCRIPTION: 'Mô tả chi tiết về phần thưởng này...',
  CREATOR_BIO: 'Giới thiệu về bản thân và đội ngũ của bạn...',
  DEFAULT: 'Bắt đầu viết nội dung...',
} as const;

export const ERROR_MESSAGES = {
  UPLOAD_FAILED: 'Không thể tải ảnh lên. Vui lòng thử lại.',
  FILE_TOO_LARGE: 'Kích thước file vượt quá giới hạn cho phép.',
  INVALID_FILE_TYPE: 'Định dạng file không được hỗ trợ.',
  INVALID_URL: 'URL không hợp lệ.',
  CONTENT_TOO_LONG: 'Nội dung vượt quá giới hạn ký tự cho phép.',
  SAVE_FAILED: 'Không thể lưu nội dung. Vui lòng thử lại.',
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra và thử lại.',
} as const;

export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

export const VIMEO_REGEX = /(?:vimeo\.com\/)(\d+)/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
