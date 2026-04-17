/**
 * Callout Extension
 * Info boxes with variants: info, warning, success, danger
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { CalloutVariant } from '@/types/editor';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (variant?: CalloutVariant) => ReturnType;
      toggleCallout: (variant?: CalloutVariant) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-variant') || 'info',
        renderHTML: attributes => {
          return {
            'data-variant': attributes.variant,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: 'callout',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant = 'info') =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { variant });
        },
      toggleCallout:
        (variant = 'info') =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { variant });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-i': () => this.editor.commands.toggleCallout('info'),
    };
  },
});
