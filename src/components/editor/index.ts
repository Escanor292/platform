/**
 * Rich Text Editor - Public exports
 */

export { default as RichTextEditor } from './RichTextEditor';
export { FloatingLinkPopover } from './FloatingLinkPopover';
export { LinkPreviewBubble } from './LinkPreviewBubble';

export { useLinkPopover } from './hooks/useLinkPopover';

export {
  normalizeUrl,
  isValidUrl,
  isValidUrlOrEmpty,
  getUrlError,
} from './utils/urlValidation';

export {
  applyLinkToSelection,
  insertLinkAtCaret,
  removeLink,
  updateLink,
  getLinkAtCursor,
  hasSelection,
  getSelectedText,
  isLinkActive,
} from './utils/linkHelpers';

export type {
  LinkPopoverMode,
  LinkData,
  LinkPopoverState,
  EditorConfig,
  ToolbarConfig,
} from './types';
