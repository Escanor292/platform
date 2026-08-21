/**
 * Product Box Popover
 * Cho phép tác giả chọn một sản phẩm thật để chèn vào bài viết.
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Package, Plus, X, Trash2, Search } from 'lucide-react';
import { restoreSelection, type SavedSelection } from '@/lib/editor/link-commands';

interface ProductItem {
  id: string;
  title: string;
  minAmount: string | number;
  maxAmount?: string | number | null;
  productImages: string[];
  campaignId: string;
  campaignTitle?: string;
  projectId?: string | null;
}

interface ProductBoxPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  savedSelection?: SavedSelection | null;
  editData?: {
    rewardId: string | null;
    title: string;
    price: string;
    imageUrl: string | null;
    linkUrl: string | null;
    pos: number | null;
  } | null;
  onCancelEdit?: () => void;
}

function formatVND(value: number | string): string {
  const num = Number(value);
  if (!num) return '0';
  return Math.round(num).toLocaleString('vi-VN');
}

export function ProductBoxPopover({
  editor,
  isOpen,
  onClose,
  savedSelection,
  editData,
  onCancelEdit,
}: ProductBoxPopoverProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSelectedId(editData?.rewardId || null);
  }, [isOpen, editData]);

  useEffect(() => {
    if (!isOpen || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    fetch('/api/rewards/my')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Không thể tải sản phẩm')))
      .then((data) => {
        const items: ProductItem[] = [];
        const seen = new Set<string>();
        const extract = (list: any[]) => {
          (list || []).forEach((campaign: any) => {
            (campaign.rewards || []).forEach((reward: any) => {
              if (!reward.isActive || seen.has(reward.id)) return;
              seen.add(reward.id);
              items.push({
                id: reward.id,
                title: reward.title,
                minAmount: reward.minAmount,
                maxAmount: reward.maxAmount,
                productImages: reward.productImages || [],
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                projectId: reward.projectId ?? campaign.projectId ?? null,
              });
            });
          });
        };
        extract(data.campaigns || []);
        (data.projectsWithRewards || []).forEach((project: any) => {
          (project.rewards || []).forEach((reward: any) => {
            if (!reward.isActive || seen.has(reward.id)) return;
            seen.add(reward.id);
            items.push({
              id: reward.id,
              title: reward.title,
              minAmount: reward.minAmount,
              maxAmount: reward.maxAmount,
              productImages: reward.productImages || [],
              campaignId: reward.campaignId || '',
              campaignTitle: project.title,
              projectId: project.id,
            });
          });
        });
        setProducts(items);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !editor?.view) return;
    try {
      const { state, view } = editor;
      const coords = view.coordsAtPos(state.selection.to);
      const editorRect = view.dom.getBoundingClientRect();
      const popoverHeight = 320;
      const spaceBelow = editorRect.bottom - coords.top;
      const top = spaceBelow >= popoverHeight
        ? coords.top - editorRect.top + view.dom.scrollTop + 24
        : coords.top - editorRect.top + view.dom.scrollTop - popoverHeight - 8;
      setPosition({
        top: Math.max(8, top),
        left: Math.max(8, Math.min(coords.left - editorRect.left, editorRect.width - 420)),
      });
    } catch {
      setPosition({ top: 12, left: 12 });
    }
  }, [isOpen, editor]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const selectedProduct = products.find((product) => product.id === selectedId) || null;
  const filtered = products.filter((product) => product.title.toLowerCase().includes(search.toLowerCase()));

  const finish = useCallback(() => {
    onClose();
    onCancelEdit?.();
  }, [onClose, onCancelEdit]);

  const handleSubmit = useCallback(() => {
    if (!selectedProduct) {
      setError('Vui lòng chọn một sản phẩm trong danh sách');
      return;
    }

    const attrs = {
      rewardId: selectedProduct.id,
      title: selectedProduct.title.trim(),
      price: String(selectedProduct.minAmount),
      imageUrl: selectedProduct.productImages?.[0] || null,
      linkUrl: `/products/${selectedProduct.id}`,
    };

    if (editData && editData.pos !== null && editData.pos !== undefined) {
      try {
        const node = editor.state.doc.nodeAt(editData.pos);
        if (node?.type.name === 'productBox') {
          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(editData.pos!, undefined, { ...node.attrs, ...attrs });
            return true;
          });
          finish();
          return;
        }
      } catch (editError) {
        console.error('Edit product box failed', editError);
      }
      editor.commands.deleteRange({ from: editData.pos, to: editData.pos + 1 });
    }

    // Clicking the popover removes editor focus. Restore the saved cursor before insertion.
    restoreSelection(editor, savedSelection || null);
    editor.chain().focus().insertContent({ type: 'productBox', attrs }).run();
    finish();
  }, [editor, selectedProduct, editData, savedSelection, finish]);

  const handleDelete = useCallback(() => {
    if (editData?.pos !== null && editData?.pos !== undefined) {
      editor.commands.deleteRange({ from: editData.pos, to: editData.pos + 1 });
      finish();
    }
  }, [editor, editData, finish]);

  if (!isOpen) return null;

  return (
    <div ref={popoverRef} className="absolute z-50 w-[400px] max-h-[480px] overflow-y-auto rounded-2xl border border-pgreen/20 bg-white shadow-xl" style={{ top: position.top, left: position.left }}>
      <div className="sticky top-0 bg-cream/60 backdrop-blur px-4 py-3 border-b border-pgreen/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-pgreen/10 flex items-center justify-center"><Package size={16} className="text-pgreen" /></div>
        <div>
          <div className="text-sm font-bold text-gray-900">{editData ? 'Chỉnh sửa hộp sản phẩm' : 'Chèn hộp sản phẩm'}</div>
          <div className="text-xs text-gray-500">Chọn sản phẩm thật để gắn vào bài viết</div>
        </div>
        <button type="button" onClick={onClose} className="ml-auto w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={16} /></button>
      </div>

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm sản phẩm của bạn..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pgreen/30 focus:border-pgreen outline-none" />
        </div>

        {error && <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="text-xs text-gray-500 py-4 text-center">Đang tải sản phẩm...</div>
          ) : filtered.length === 0 ? (
            <div className="text-xs text-gray-500 py-4 text-center">{products.length === 0 ? 'Bạn chưa có sản phẩm đang hoạt động.' : 'Không tìm thấy sản phẩm phù hợp.'}</div>
          ) : (
            filtered.map((product) => (
              <button key={product.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSelectedId(product.id); setError(''); }} className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${selectedId === product.id ? 'border-pgreen bg-pgreen/10 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                {product.productImages?.[0] ? <img src={product.productImages[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><Package size={16} /></div>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{product.title}</div>
                  <div className="text-xs text-gray-500 truncate">{formatVND(product.minAmount)} đ{product.maxAmount ? ` (giá gốc ${formatVND(product.maxAmount)} đ)` : ''}{product.campaignTitle ? ` • ${product.campaignTitle}` : ''}</div>
                </div>
                {selectedId === product.id && <span className="text-pgreen text-xs font-bold">✓ Đã chọn</span>}
              </button>
            ))
          )}
        </div>

        {selectedProduct && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-500 mb-2">Xem trước</div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
              {selectedProduct.productImages?.[0] ? <img src={selectedProduct.productImages[0]} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={20} className="text-gray-400" /></div>}
              <div className="flex-1 min-w-0"><div className="text-sm font-bold text-gray-900 truncate">{selectedProduct.title}</div><div className="text-sm font-bold text-pgreen mt-0.5">{formatVND(selectedProduct.minAmount)} đ</div></div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={handleSubmit} disabled={!selectedProduct} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-pgreen text-white text-sm font-semibold rounded-xl hover:bg-pgreen/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"><Plus size={15} />{editData ? 'Cập nhật' : 'Chèn vào bài viết'}</button>
          {editData && <button type="button" onClick={handleDelete} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100" title="Xóa hộp sản phẩm"><Trash2 size={15} /></button>}
        </div>
      </div>
    </div>
  );
}
