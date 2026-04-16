/**
 * Rich Text Editor Demo Page
 */

'use client';

import React, { useState } from 'react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

export default function EditorDemoPage() {
  const [content, setContent] = useState('<p>Chào mừng đến với <strong>Rich Text Editor</strong>!</p><p>Hãy thử các tính năng:</p><ul><li>Bôi đen text và bấm nút Link hoặc <kbd>Cmd/Ctrl+K</kbd></li><li>Đặt con trỏ và chèn link mới</li><li>Click vào link để edit/remove</li></ul><p>Ví dụ link: <a href="https://example.com">Xem thêm</a></p>');
  const [showHtml, setShowHtml] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Rich Text Editor Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modern contextual link editor với floating popover
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Hướng dẫn sử dụng
          </h2>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• <strong>Chèn link với text đã chọn:</strong> Bôi đen text → bấm nút Link hoặc Cmd/Ctrl+K → nhập URL → Enter</li>
            <li>• <strong>Chèn link mới:</strong> Đặt con trỏ → Cmd/Ctrl+K → nhập text và URL → Enter</li>
            <li>• <strong>Edit link:</strong> Click vào link → bấm Sửa → chỉnh sửa URL</li>
            <li>• <strong>Remove link:</strong> Click vào link → bấm Xóa</li>
            <li>• <strong>Open link:</strong> Click vào link → bấm Mở</li>
          </ul>
        </div>

        {/* Editor */}
        <div className="mb-6">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Bắt đầu viết nội dung của bạn..."
            className="shadow-sm"
          />
        </div>

        {/* HTML Output */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              HTML Output
            </h3>
            <button
              onClick={() => setShowHtml(!showHtml)}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              {showHtml ? 'Ẩn' : 'Hiện'} HTML
            </button>
          </div>
          
          {showHtml && (
            <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto text-xs">
              <code className="text-gray-800 dark:text-gray-200">
                {content}
              </code>
            </pre>
          )}
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              ✨ Tính năng UX
            </h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Floating popover gần vị trí thao tác</li>
              <li>• Không làm mất selection</li>
              <li>• Keyboard-first (Enter, Esc, Tab)</li>
              <li>• Auto-focus input</li>
              <li>• Click outside để đóng</li>
            </ul>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              🔧 Tính năng kỹ thuật
            </h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• URL validation & normalization</li>
              <li>• Auto-add https://</li>
              <li>• Edit existing links</li>
              <li>• Remove links</li>
              <li>• Open in new tab</li>
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'TipTap', 'Tailwind CSS', 'BubbleMenu'].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
