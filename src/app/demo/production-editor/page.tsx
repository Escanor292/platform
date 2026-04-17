/**
 * Production Editor Demo Page
 * Showcase all features of the production-ready editor
 */

'use client';

import React, { useState } from 'react';
import { ProductionEditor } from '@/components/editor/ProductionEditor';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { Eye, Code, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionEditorDemo() {
  const [content, setContent] = useState(`
    <h1>Welcome to the Production Editor</h1>
    <p>This is a <strong>production-ready</strong> rich text editor with all the features you need for a crowdfunding platform.</p>
    
    <h2>Key Features</h2>
    <ul>
      <li>Rich text formatting (bold, italic, underline, etc.)</li>
      <li>Headings, lists, and blockquotes</li>
      <li>Image uploads with captions</li>
      <li>Video embeds (YouTube & Vimeo)</li>
      <li>Callout boxes for important information</li>
      <li>Task lists for project milestones</li>
      <li>Code blocks for technical details</li>
    </ul>

    <h2>Try These Features</h2>
    <p>Select text to see the bubble menu, or type <code>/</code> to see slash commands.</p>

    <div data-type="callout" data-variant="info">
      <p><strong>💡 Pro Tip:</strong> Use keyboard shortcuts like Ctrl+B for bold, Ctrl+I for italic, and Ctrl+K for links.</p>
    </div>

    <h3>Task List Example</h3>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><div><p>Set up project</p></div></label></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><div><p>Create campaign description</p></div></label></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><div><p>Add rewards</p></div></label></li>
    </ul>

    <blockquote>
      <p>"The best way to predict the future is to create it." - Peter Drucker</p>
    </blockquote>
  `);

  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [showCode, setShowCode] = useState(false);

  // Mock save function
  const handleSave = async (content: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved content:', content);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Production Editor Demo
          </h1>
          <p className="text-lg text-gray-600">
            A complete rich text editor for crowdfunding campaigns
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('edit')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'edit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                mode === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              onClick={() => setMode('split')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                mode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Split
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="px-4 py-2 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <Code size={16} />
              {showCode ? 'Hide' : 'Show'} HTML
            </button>
            <button
              onClick={() => {
                handleSave(content);
                toast.success('Content saved successfully!');
              }}
              className="px-4 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>

        {/* Editor/Preview */}
        <div className="grid gap-6" style={{
          gridTemplateColumns: mode === 'split' ? '1fr 1fr' : '1fr'
        }}>
          {/* Editor */}
          {(mode === 'edit' || mode === 'split') && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Editor</h2>
              <ProductionEditor
                content={content}
                onChange={setContent}
                config={{
                  placeholder: 'Hãy kể câu chuyện chiến dịch của bạn...',
                  autosave: true,
                  autosaveDelay: 2000,
                  enableBubbleMenu: true,
                }}
                callbacks={{
                  onSave: handleSave,
                  onError: (error) => {
                    console.error('Editor error:', error);
                    toast.error('An error occurred');
                  },
                }}
              />
            </div>
          )}

          {/* Preview */}
          {(mode === 'preview' || mode === 'split') && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Preview</h2>
              <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                <EditorPreview content={content} />
              </div>
            </div>
          )}
        </div>

        {/* HTML Code */}
        {showCode && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">HTML Output</h2>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                {content}
              </pre>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="Rich Formatting"
            description="Bold, italic, underline, strikethrough, code, and highlight"
            icon="✨"
          />
          <FeatureCard
            title="Headings & Lists"
            description="H1-H3 headings, bullet lists, numbered lists, and task lists"
            icon="📝"
          />
          <FeatureCard
            title="Media Support"
            description="Upload images with captions and embed YouTube/Vimeo videos"
            icon="🖼️"
          />
          <FeatureCard
            title="Callout Boxes"
            description="Info, warning, success, and danger callouts for emphasis"
            icon="💡"
          />
          <FeatureCard
            title="Code Blocks"
            description="Inline code and syntax-highlighted code blocks"
            icon="💻"
          />
          <FeatureCard
            title="Autosave"
            description="Automatic saving with debounce and save status indicator"
            icon="💾"
          />
          <FeatureCard
            title="Keyboard Shortcuts"
            description="Full keyboard support for power users"
            icon="⌨️"
          />
          <FeatureCard
            title="Paste Handling"
            description="Smart paste from Word, Google Docs, and websites"
            icon="📋"
          />
          <FeatureCard
            title="Security"
            description="Multi-layer sanitization to prevent XSS attacks"
            icon="🔒"
          />
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyboard Shortcuts</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ShortcutItem shortcut="Ctrl+B" description="Bold" />
            <ShortcutItem shortcut="Ctrl+I" description="Italic" />
            <ShortcutItem shortcut="Ctrl+U" description="Underline" />
            <ShortcutItem shortcut="Ctrl+K" description="Insert link" />
            <ShortcutItem shortcut="Ctrl+E" description="Inline code" />
            <ShortcutItem shortcut="Ctrl+Shift+8" description="Bullet list" />
            <ShortcutItem shortcut="Ctrl+Shift+7" description="Numbered list" />
            <ShortcutItem shortcut="Ctrl+Shift+9" description="Task list" />
            <ShortcutItem shortcut="Ctrl+Alt+1" description="Heading 1" />
            <ShortcutItem shortcut="Ctrl+Alt+2" description="Heading 2" />
            <ShortcutItem shortcut="Ctrl+Alt+3" description="Heading 3" />
            <ShortcutItem shortcut="/" description="Slash commands" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function ShortcutItem({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm font-mono font-semibold text-gray-700">
        {shortcut}
      </kbd>
      <span className="text-sm text-gray-600">{description}</span>
    </div>
  );
}
