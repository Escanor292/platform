'use client';

import { useState } from 'react';
import { Settings, ChevronUp, ChevronDown, Edit, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface EditBlock {
  label: string;
  editUrl?: string;
  description?: string;
  /** Called when clicked; enables instant in-place editing instead of navigation */
  onEdit?: () => void;
}

interface OwnerEditPanelProps {
  isOwner: boolean;
  blocks: EditBlock[];
}

export default function OwnerEditPanel({ isOwner, blocks }: OwnerEditPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOwner) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings size={18} />
            <span className="font-semibold text-sm">Chỉnh sửa nhanh</span>
          </div>
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-3 max-w-sm">
            {blocks.map((block, index) =>
              block.onEdit ? (
                <button
                  key={index}
                  onClick={block.onEdit}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Edit size={14} className="text-purple-600 flex-shrink-0" />
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {block.label}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">
                          Sửa ngay
                        </span>
                      </div>
                      {block.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {block.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 ml-2" />
                  </div>
                </button>
              ) : (
                <Link
                  key={index}
                  href={block.editUrl || '#'}
                  className="block group"
                >
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Edit size={14} className="text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {block.label}
                        </span>
                      </div>
                      {block.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {block.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" />
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
