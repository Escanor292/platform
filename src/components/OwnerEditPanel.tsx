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
  /** Nhường chỗ nút xem như khách bên trái */
  besideEye?: boolean;
}

export default function OwnerEditPanel({ isOwner, blocks, besideEye = false }: OwnerEditPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOwner) return null;

  return (
    <div
      className={`fixed z-[60] max-w-[min(22rem,calc(100vw-5.75rem))] bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 ${
        besideEye ? "left-[4.25rem] md:left-[5.25rem]" : "left-3 md:left-6"
      }`}
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-pgreen/15 bg-white shadow-soft">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between bg-gradient-to-r from-pgreen to-fgreen px-4 py-3 text-white transition-colors hover:from-pgreen/90 hover:to-fgreen/90"
        >
          <div className="flex items-center gap-2">
            <Settings size={18} />
            <span className="text-sm font-bold">Chỉnh sửa nhanh</span>
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
                  className="group w-full text-left"
                >
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-cream/70 p-3 transition-colors hover:border-pgreen/30 hover:bg-fgreen/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Edit size={14} className="text-pgreen flex-shrink-0" />
                        <span className="text-sm font-bold text-dblue truncate">
                          {block.label}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-pgreen bg-fgreen/10 px-1.5 py-0.5 rounded">
                          Sửa ngay
                        </span>
                      </div>
                      {block.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {block.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-pgreen transition-colors flex-shrink-0 ml-2" />
                  </div>
                </button>
              ) : (
                <Link
                  key={index}
                  href={block.editUrl || '#'}
                  className="block group"
                >
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-cream/70 p-3 transition-colors hover:border-pgreen/30 hover:bg-fgreen/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Edit size={14} className="text-pgreen flex-shrink-0" />
                        <span className="text-sm font-bold text-dblue truncate">
                          {block.label}
                        </span>
                      </div>
                      {block.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {block.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink size={14} className="text-gray-400 group-hover:text-pgreen transition-colors flex-shrink-0 ml-2" />
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
