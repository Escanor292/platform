/**
 * TypeScript types for Rich Text Editor
 */

export type LinkPopoverMode = 'insert' | 'edit' | 'preview' | 'closed';

export interface LinkData {
  url: string;
  text?: string;
}

export interface LinkPopoverState {
  mode: LinkPopoverMode;
  url: string;
  text: string;
  error: string | null;
  isOpen: boolean;
}

export interface EditorConfig {
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  editable?: boolean;
}

export interface ToolbarConfig {
  showBold?: boolean;
  showItalic?: boolean;
  showStrike?: boolean;
  showHeadings?: boolean;
  showLists?: boolean;
  showLink?: boolean;
  showUndo?: boolean;
}
