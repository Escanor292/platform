/**
 * Legacy export — all editing goes through ProductionEditor.
 */

'use client';

import { ProductionEditor } from './ProductionEditor';

interface SimplifiedEnhancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: SimplifiedEnhancedEditorProps) {
  return (
    <ProductionEditor
      content={content}
      onChange={onChange}
      config={{
        placeholder,
        autosave: false,
        enableBubbleMenu: true,
      }}
    />
  );
}
