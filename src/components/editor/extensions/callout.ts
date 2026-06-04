/**
 * Callout Extension
 * Info boxes with variants: info, warning, success, danger
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { CalloutVariant } from '@/types/editor';
import { NodeSelection } from '@tiptap/pm/state';

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
            const { empty } = selection;

            // Check if the callout node itself is selected (NodeSelection)
            const isCalloutNodeSelected =
              selection instanceof NodeSelection &&
              selection.node.type.name === 'callout';

            // 1. If callout node itself is selected with same variant -> lift out
            if (isCalloutNodeSelected && editor.isActive('callout', { variant })) {
              return commands.lift('callout');
            }

            // 2. If callout node itself is selected with different variant -> change variant
            if (isCalloutNodeSelected && editor.isActive('callout')) {
              return commands.updateAttributes('callout', { variant });
            }

            // 3. If has text selection -> wrap selection into callout
            if (!empty) {
              return commands.wrapIn('callout', { variant });
            }

            // 4. Empty selection -> insert new callout at cursor position
            // This allows creating nested callouts when cursor is inside another callout
            return commands.insertContent({
              type: 'callout',
              attrs: { variant },
              content: [{ type: 'paragraph' }],
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
