'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';

export default function TestEditorPage() {
  const [content, setContent] = useState('<p>Test editor - bôi đen text này và nhấn Ctrl+K</p>');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Test Rich Text Editor</h1>
          <p className="text-sm text-gray-600">
            <strong>Để test các tính năng:</strong>
          </p>
          <ol className="text-sm text-gray-600 list-decimal ml-5 mt-2">
            <li>Bôi đen text bên dưới</li>
            <li>Nhấn <kbd className="px-2 py-1 bg-white border rounded">Ctrl+K</kbd> hoặc click nút Link (🔗)</li>
            <li>Click nút Image (🖼️) để upload ảnh từ máy tính</li>
            <li>Thử các nút format khác: Bold, Italic, Heading, List, v.v.</li>
          </ol>
        </div>

        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Gõ nội dung ở đây..."
        />

        <div className="mt-4 p-4 bg-white border rounded-lg">
          <h3 className="font-bold mb-2">HTML Output:</h3>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
