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
    setCallout: (variant?: CalloutVariant) => ReturnType;
    toggleCallout: (variant?: CalloutVariant) => ReturnType;
    callout: {
      setCallout: (variant?: CalloutVariant) => ReturnType;
      toggleCallout: (variant?: CalloutVariant) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block*',

  defining: true,

  isolating: false,

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
        getAttrs: element => ({
          variant: (element as HTMLElement).getAttribute('data-variant') || 'info',
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
        class: `callout callout-${HTMLAttributes.variant || 'info'}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (variant = 'info') =>
          ({ editor, commands, state }) => {
            // Already in a callout -> just update variant
            if (editor.isActive('callout')) {
              return commands.updateAttributes('callout', { variant });
            }

            const { selection } = state;

            // Empty selection -> insert new callout with empty paragraph
            if (selection.empty) {
              return commands.insertContent({
                type: 'callout',
                attrs: { variant },
                content: [{ type: 'paragraph' }],
              });
            }

            // Has selection -> wrap selection into callout
            return commands.wrapIn('callout', { variant });
          },
      toggleCallout:
        (variant = 'info') =>
          ({ editor, commands, state }) => {
            const { selection } = state;

            // 1. Same variant active -> lift out of callout
            if (editor.isActive('callout', { variant })) {
              return commands.lift('callout');
            }

            // 2. Different variant active -> update variant only
            if (editor.isActive('callout')) {
              return commands.updateAttributes('callout', { variant });
            }

            // 3. Empty selection -> insert new callout with empty paragraph
            if (selection.empty) {
              return commands.insertContent({
                type: 'callout',
                attrs: { variant },
                content: [{ type: 'paragraph' }],
              });
            }

            // 4. Has selection -> wrap selection into callout
            const wrapped = commands.wrapIn('callout', { variant });
            if (wrapped) return true;

            // 5. Fallback: don't lose data, return false
            return false;
          },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-i': () => this.editor.commands.toggleCallout('info'),
    };
  },
});
