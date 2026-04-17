/**
 * Editor Components - Public API
 * Export all editor components and utilities
 */

// Main components
export { ProductionEditor } from './ProductionEditor';
export { EditorPreview, EditorPreviewServer } from './EditorPreview';
export { EditorToolbar } from './EditorToolbar';
export { EditorBubbleMenu } from './EditorBubbleMenu';

// Extensions
export { getEditorExtensions, ImageWithCaption, VideoEmbed, Callout } from './extensions';

// Legacy component (for backward compatibility)
export { default as RichTextEditor } from './RichTextEditor';
