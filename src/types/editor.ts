/**
 * Rich Text Editor Types
 * Production-ready type definitions for the editor system
 */

import { Editor } from '@tiptap/react';

// ============================================
// EDITOR CONFIGURATION
// ============================================

export interface EditorConfig {
  placeholder?: string;
  maxLength?: number;
  autosave?: boolean;
  autosaveDelay?: number;
  enableSlashCommands?: boolean;
  enableBubbleMenu?: boolean;
  enableFloatingMenu?: boolean;
  readOnly?: boolean;
  editable?: boolean;
}

// ============================================
// CONTENT TYPES
// ============================================

export type EditorContent = string; // HTML string or JSON string

export interface EditorState {
  content: EditorContent;
  isEmpty: boolean;
  wordCount: number;
  characterCount: number;
  isDirty: boolean;
  lastSaved?: Date;
}

// ============================================
// SAVE STATUS
// ============================================

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface SaveState {
  status: SaveStatus;
  lastSaved?: Date;
  error?: string;
}

// ============================================
// CALLOUT VARIANTS
// ============================================

export type CalloutVariant = 'info' | 'warning' | 'success' | 'danger';

export interface CalloutAttrs {
  variant: CalloutVariant;
}

// ============================================
// IMAGE ATTRIBUTES
// ============================================

export type ImageAlignment = 'left' | 'center' | 'right';

export interface ImageAttrs {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  alignment?: ImageAlignment;
  width?: number;
  height?: number;
}

// ============================================
// VIDEO EMBED ATTRIBUTES
// ============================================

export type VideoProvider = 'youtube' | 'vimeo';

export interface VideoEmbedAttrs {
  src: string;
  provider: VideoProvider;
  width?: number;
  height?: number;
}

// ============================================
// LINK ATTRIBUTES
// ============================================

export interface LinkAttrs {
  href: string;
  target?: '_blank' | '_self';
  rel?: string;
  title?: string;
}

// ============================================
// SLASH COMMAND ITEMS
// ============================================

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
  keywords?: string[];
}

export interface SlashCommandGroup {
  name: string;
  items: SlashCommandItem[];
}

// ============================================
// VALIDATION
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ContentValidationRules {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  allowedBlocks?: string[];
  maxImages?: number;
}

// ============================================
// UPLOAD
// ============================================

export interface UploadResponse {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// ============================================
// EDITOR CALLBACKS
// ============================================

export interface EditorCallbacks {
  onChange?: (content: EditorContent) => void;
  onSave?: (content: EditorContent) => Promise<void>;
  onBlur?: () => void;
  onFocus?: () => void;
  onError?: (error: Error) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
}

// ============================================
// EDITOR PROPS
// ============================================

export interface RichTextEditorProps {
  content: EditorContent;
  onChange: (content: EditorContent) => void;
  config?: EditorConfig;
  callbacks?: EditorCallbacks;
  className?: string;
}

// ============================================
// PREVIEW PROPS
// ============================================

export interface RichTextPreviewProps {
  content: EditorContent;
  className?: string;
}

// ============================================
// TOOLBAR PROPS
// ============================================

export interface EditorToolbarProps {
  editor: Editor | null;
}

export interface BubbleMenuProps {
  editor: Editor | null;
}

// ============================================
// SANITIZATION
// ============================================

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
  allowedIframeDomains?: string[];
}

export interface SanitizeResult {
  clean: string;
  removed: string[];
  modified: boolean;
}
