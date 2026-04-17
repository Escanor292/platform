/**
 * Enhanced Image Extension
 * Supports captions, alignment, and sizing
 */

import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export interface ImageWithCaptionOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageWithCaption: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        caption?: string;
        alignment?: 'left' | 'center' | 'right';
      }) => ReturnType;
      setImageAlignment: (alignment: 'left' | 'center' | 'right') => ReturnType;
      setImageCaption: (caption: string) => ReturnType;
    };
  }
}

export const ImageWithCaption = Image.extend<ImageWithCaptionOptions>({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: element => element.getAttribute('data-caption'),
        renderHTML: attributes => {
          if (!attributes.caption) return {};
          return {
            'data-caption': attributes.caption,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => {
          return {
            'data-alignment': attributes.alignment,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { caption, alignment, ...imgAttrs } = HTMLAttributes;
    
    // If no caption, render simple image
    if (!caption) {
      return [
        'img',
        mergeAttributes(this.options.HTMLAttributes, imgAttrs, {
          'data-alignment': alignment,
        }),
      ];
    }
    
    // Render image with caption wrapper
    return [
      'figure',
      {
        class: 'image-with-caption',
        'data-alignment': alignment,
      },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, imgAttrs),
      ],
      [
        'figcaption',
        {},
        caption,
      ],
    ];
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      setImageAlignment:
        alignment =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { alignment });
        },
      setImageCaption:
        caption =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { caption });
        },
    };
  },
});
