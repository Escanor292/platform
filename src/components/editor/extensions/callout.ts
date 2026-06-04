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
        ({ editor, commands }) => {
          if (editor.isActive('callout')) {
            return commands.updateAttributes('callout', { variant });
          }

          const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
          );

          return commands.insertContent({
            type: 'callout',
            attrs: { variant },
            content: [
              {
                type: 'paragraph',
                content: selectedText
                  ? [{ type: 'text', text: selectedText }]
                  : [],
              },
            ],
          });
        },
      toggleCallout:
        (variant = 'info') =>
        ({ editor, commands }) => {
          if (editor.isActive('callout', { variant })) {
            return commands.lift('callout');
          }

          if (editor.isActive('callout')) {
            return commands.updateAttributes('callout', { variant });
          }

          const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
          );

          return commands.insertContent({
            type: 'callout',
            attrs: { variant },
            content: [
              {
                type: 'paragraph',
                content: selectedText
                  ? [{ type: 'text', text: selectedText }]
                  : [],
              },
            ],
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-i': () => this.editor.commands.toggleCallout('info'),
    };
  },
});
