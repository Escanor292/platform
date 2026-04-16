/**
 * Advanced Editor Example
 * Demonstrates additional features and customization
 */

'use client';

import React, { useState } from 'react';
import { RichTextEditor } from '../RichTextEditor';

export function AdvancedEditorExample() {
  const [content, setContent] = useState(`
    <h2>Welcome to Advanced Editor</h2>
    <p>This editor demonstrates advanced link handling:</p>
    <ul>
      <li>Contextual floating popover for links</li>
      <li>Keyboard shortcuts (Cmd/Ctrl+K)</li>
      <li>Edit existing links by clicking them</li>
      <li>Auto URL normalization</li>
    </ul>
    <p>Try it: <a href="https://example.com">Example Link</a></p>
  `);

  const [savedContent, setSavedContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    
    // Calculate word count
    const text = newContent.replace(/<[^>]*>/g, ' ').trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSave = () => {
    setSavedContent(content);
    alert('Content saved!');
  };

  const handleClear = () => {
    if (confirm('Clear all content?')) {
      setContent('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Words: <strong>{wordCount}</strong></span>
          <span>Characters: <strong>{content.length}</strong></span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <RichTextEditor
        content={content}
        onChange={handleChange}
        placeholder="Start writing your content..."
        className="min-h-[400px]"
      />

      {/* Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Pro Tips
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Use <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">Cmd/Ctrl+K</kbd> to quickly insert links</li>
          <li>• Click on any link to edit, open, or remove it</li>
          <li>• The popover appears near your cursor for better UX</li>
          <li>• URLs are automatically normalized (e.g., "google.com" → "https://google.com")</li>
        </ul>
      </div>

      {/* Saved Content Preview */}
      {savedContent && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            ✓ Last Saved Content
          </h3>
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: savedContent }}
          />
        </div>
      )}
    </div>
  );
}
