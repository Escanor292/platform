/**
 * Video Embed Extension
 * Enhanced YouTube extension with Vimeo support
 */

import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoEmbedOptions {
  addPasteHandler: boolean;
  allowFullscreen: boolean;
  autoplay: boolean;
  ccLanguage?: string;
  ccLoadPolicy?: boolean;
  controls: boolean;
  disableKBcontrols: boolean;
  enableIFrameApi: boolean;
  endTime: number;
  height: number;
  interfaceLanguage?: string;
  ivLoadPolicy: number;
  loop: boolean;
  modestBranding: boolean;
  nocookie: boolean;
  origin?: string;
  playlist?: string;
  progressBarColor?: string;
  width: number;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setYouTubeVideo: (options: { src: string }) => ReturnType;
      setVimeoVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      ccLanguage: undefined,
      ccLoadPolicy: undefined,
      controls: true,
      disableKBcontrols: false,
      enableIFrameApi: false,
      endTime: 0,
      height: 480,
      interfaceLanguage: undefined,
      ivLoadPolicy: 0,
      loop: false,
      modestBranding: false,
      nocookie: true,
      origin: undefined,
      playlist: undefined,
      progressBarColor: undefined,
      width: 640,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      provider: {
        default: 'youtube',
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, provider, width, height } = HTMLAttributes;
    
    let embedUrl = src;
    
    // Convert YouTube URL to embed format
    if (provider === 'youtube') {
      const videoId = extractYouTubeId(src);
      if (videoId) {
        embedUrl = this.options.nocookie
          ? `https://www.youtube-nocookie.com/embed/${videoId}`
          : `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert Vimeo URL to embed format
    if (provider === 'vimeo') {
      const videoId = extractVimeoId(src);
      if (videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-type': 'video-embed',
        'data-provider': provider,
      }),
      [
        'iframe',
        {
          src: embedUrl,
          width: width || this.options.width,
          height: height || this.options.height,
          frameborder: '0',
          allowfullscreen: this.options.allowFullscreen ? 'true' : 'false',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setYouTubeVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          const videoId = extractYouTubeId(options.src);
          if (!videoId) return false;
          
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              provider: 'youtube',
            },
          });
        },
      setVimeoVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          const videoId = extractVimeoId(options.src);
          if (!videoId) return false;
          
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              provider: 'vimeo',
            },
          });
        },
    };
  },
});

// Helper functions
function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/)(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
