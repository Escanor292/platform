/**
 * Editor Extensions Configuration
 * Centralized extension setup for Tiptap editor
 */

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { Color } from '@tiptap/extension-color';

import { ImageWithCaption } from './image-with-caption';
import { VideoEmbed } from './video-embed';
import { Callout } from './callout';
import { ProductBox } from './product-box';
import { EDITOR_LIMITS, KEYBOARD_SHORTCUTS } from '@/lib/editor/constants';

export interface EditorExtensionsConfig {
  placeholder?: string;
  maxLength?: number;
  enableSlashCommands?: boolean;
}

export function getEditorExtensions(config: EditorExtensionsConfig = {}) {
  const {
    placeholder = 'Bắt đầu viết hoặc gõ / để xem các lệnh...',
    maxLength = EDITOR_LIMITS.MAX_CONTENT_LENGTH,
    enableSlashCommands = true,
  } = config;

  return [
    // Core editing
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
      blockquote: {
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic text-gray-700',
        },
      },
      code: {
        HTMLAttributes: {
          class: 'bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono',
        },
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm',
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: 'my-8 border-gray-300',
        },
      },
      dropcursor: {
        color: '#3b82f6',
        width: 2,
      },
      gapcursor: false,
    }),

    // Text formatting
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: 'bg-yellow-200 px-1 rounded',
      },
    }),

    // Links
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline hover:text-blue-700 cursor-pointer',
        rel: 'noopener noreferrer',
      },
      validate: href => /^https?:\/\//.test(href),
    }),

    // Text alignment
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
    }),

    // Task lists
    TaskList.configure({
      HTMLAttributes: {
        class: 'not-prose',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'flex items-start gap-2',
      },
    }),

    // Typography improvements
    Typography.configure({
      // Smart quotes, dashes, ellipsis
    }),

    // Placeholder
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
      showOnlyCurrent: false,
    }),

    // Character count
    CharacterCount.configure({
      limit: maxLength,
    }),

    // Custom extensions
    ImageWithCaption.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto',
      },
    }),

    VideoEmbed.configure({
      width: 640,
      height: 360,
      controls: true,
      nocookie: true,
      allowFullscreen: true,
    }),

    Callout.configure({
      HTMLAttributes: {
        class: 'callout',
      },
    }),

    ProductBox.configure({
      HTMLAttributes: {
        class: 'product-box',
      },
    }),
  ];
}

// Export individual extensions for selective use
export {
  ImageWithCaption,
  VideoEmbed,
  Callout,
  ProductBox,
};
