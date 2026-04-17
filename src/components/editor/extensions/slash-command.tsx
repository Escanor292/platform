/**
 * Slash Command Extension
 * Type "/" to show block insertion menu
 */

import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SlashCommandItem, SlashCommandGroup } from '@/types/editor';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Info,
  Image as ImageIcon,
  Video,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }: { editor: Editor; range: any; props: any }) => {
          props.command({ editor, range });
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

// Command groups
export function getSlashCommandGroups(editor: Editor): SlashCommandGroup[] {
  return [
    {
      name: 'Định dạng cơ bản',
      items: [
        {
          title: 'Tiêu đề 1',
          description: 'Tiêu đề lớn',
          icon: 'H1',
          command: (editor) => {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          },
          keywords: ['heading', 'h1', 'title'],
        },
        {
          title: 'Tiêu đề 2',
          description: 'Tiêu đề trung bình',
          icon: 'H2',
          command: (editor) => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          },
          keywords: ['heading', 'h2', 'subtitle'],
        },
        {
          title: 'Tiêu đề 3',
          description: 'Tiêu đề nhỏ',
          icon: 'H3',
          command: (editor) => {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          },
          keywords: ['heading', 'h3'],
        },
        {
          title: 'Danh sách dấu chấm',
          description: 'Tạo danh sách không đánh số',
          icon: 'list',
          command: (editor) => {
            editor.chain().focus().toggleBulletList().run();
          },
          keywords: ['bullet', 'list', 'ul'],
        },
        {
          title: 'Danh sách đánh số',
          description: 'Tạo danh sách có đánh số',
          icon: 'ordered-list',
          command: (editor) => {
            editor.chain().focus().toggleOrderedList().run();
          },
          keywords: ['numbered', 'list', 'ol'],
        },
        {
          title: 'Checklist',
          description: 'Danh sách công việc',
          icon: 'check-square',
          command: (editor) => {
            editor.chain().focus().toggleTaskList().run();
          },
          keywords: ['todo', 'task', 'checkbox'],
        },
      ],
    },
    {
      name: 'Nội dung',
      items: [
        {
          title: 'Trích dẫn',
          description: 'Khối trích dẫn',
          icon: 'quote',
          command: (editor) => {
            editor.chain().focus().toggleBlockquote().run();
          },
          keywords: ['quote', 'blockquote'],
        },
        {
          title: 'Code',
          description: 'Khối mã nguồn',
          icon: 'code',
          command: (editor) => {
            editor.chain().focus().toggleCodeBlock().run();
          },
          keywords: ['code', 'codeblock', 'pre'],
        },
        {
          title: 'Đường kẻ ngang',
          description: 'Phân cách nội dung',
          icon: 'minus',
          command: (editor) => {
            editor.chain().focus().setHorizontalRule().run();
          },
          keywords: ['hr', 'divider', 'line'],
        },
      ],
    },
    {
      name: 'Callout',
      items: [
        {
          title: 'Info Box',
          description: 'Hộp thông tin',
          icon: 'info',
          command: (editor) => {
            editor.chain().focus().setCallout('info').run();
          },
          keywords: ['callout', 'info', 'note'],
        },
        {
          title: 'Warning Box',
          description: 'Hộp cảnh báo',
          icon: 'alert-triangle',
          command: (editor) => {
            editor.chain().focus().setCallout('warning').run();
          },
          keywords: ['callout', 'warning', 'caution'],
        },
        {
          title: 'Success Box',
          description: 'Hộp thành công',
          icon: 'check-circle',
          command: (editor) => {
            editor.chain().focus().setCallout('success').run();
          },
          keywords: ['callout', 'success', 'tip'],
        },
        {
          title: 'Danger Box',
          description: 'Hộp nguy hiểm',
          icon: 'alert-circle',
          command: (editor) => {
            editor.chain().focus().setCallout('danger').run();
          },
          keywords: ['callout', 'danger', 'error'],
        },
      ],
    },
  ];
}
