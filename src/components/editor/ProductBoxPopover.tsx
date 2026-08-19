/**
 * Product Box Popover
 * Let authors pick a product (reward) to insert into blog content
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Package, Plus, X, Trash2, Search } from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  minAmount: string;
  maxAmount?: string | null;
  productImages: string[];
  campaignId: string;
  campaignTitle?: string;
  projectId?: string | null;
}

interface ProductBoxPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
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
  editData,
  onCancelEdit,
}: ProductBoxPopoverProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Manual override fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualLinkUrl, setManualLinkUrl] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    // Auto-fill when editing an existing product box
    if (editData) {
      setSelectedId(editData.rewardId || null);
      setManualTitle(editData.title || '');
      setManualPrice(editData.price || '');
      setManualImageUrl(editData.imageUrl || '');
      setManualLinkUrl(editData.linkUrl || '');
    }
  }, [isOpen, editData]);

  // Load products once
  useEffect(() => {
    if (!isOpen || loadedRef.current) return;
    loadedRef.current = true;
    setLoading(true);
    fetch('/api/rewards/my')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('Không thể tải sản phẩm'))))
      .then(data => {
        // API returns { campaigns, projects, projectsWithCampaigns } — flatten rewards
        const items: ProductItem[] = [];
        const seen = new Set<string>();
        const extract = (list: any[]) => {
          (list || []).forEach((c: any) => {
            (c.rewards || []).forEach((r: any) => {
              if (r.isActive && !seen.has(r.id)) {
                seen.add(r.id);
                items.push({
                  id: r.id,
                  title: r.title,
                  minAmount: r.minAmount,
                  maxAmount: r.maxAmount,
                  productImages: r.productImages || [],
                  campaignId: c.id,
                  campaignTitle: c.title,
                  projectId: r.projectId ?? c.projectId ?? null,
                });
              }
            });
          });
        };
        extract(data.campaigns || []);
        (data.projectsWithCampaigns || []).forEach((p: any) => extract(p.campaigns || []));
        setProducts(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Position popover near cursor
  useEffect(() => {
    if (!isOpen || !editor?.view) return;
    try {
      const { state, view } = editor;
      const { to } = state.selection;
      const coords = view.coordsAtPos(to);
      const editorRect = view.dom.getBoundingClientRect();
      const popoverHeight = 320;
      const spaceBelow = editorRect.bottom - coords.top;
      const top =
        spaceBelow >= popoverHeight
          ? coords.top - editorRect.top + view.dom.scrollTop + 24
          : coords.top - editorRect.top + view.dom.scrollTop - popoverHeight - 8;
      setPosition({ top: Math.max(8, top), left: Math.min(coords.left - editorRect.left, editorRect.width - 420) });
    } catch {
      setPosition({ top: 12, left: 12 });
    }
  }, [isOpen, editor]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const selectedProduct = products.find(p => p.id === selectedId) || null;

  const finalTitle = selectedProduct?.title || manualTitle;
  const finalPrice = selectedProduct ? selectedProduct.minAmount : manualPrice;
  const finalImageUrl = selectedProduct?.productImages?.[0] || manualImageUrl;
  // Link: product detail page if it has campaign; otherwise fallback to manual link
  const finalLinkUrl =
    manualLinkUrl || (selectedProduct ? `/products/${selectedProduct.id}` : '');

  const handleSubmit = useCallback(() => {
    if (!finalTitle.trim() || !finalPrice.trim()) {
      setError('Vui lòng chọn sản phẩm hoặc nhập tên và giá sản phẩm');
      return;
    }

    const attrs = {
      rewardId: selectedId || null,
      title: finalTitle.trim(),
      price: finalPrice.trim(),
      imageUrl: finalImageUrl || null,
      linkUrl: finalLinkUrl || null,
    };

    if (editData && editData.pos !== null && editData.pos !== undefined) {
      // Edit existing: replace node attributes
      try {
        const { doc } = editor.state;
        const node = doc.nodeAt(editData.pos);
        if (node && node.type.name === 'productBox') {
          editor.commands.command(({ tr }) => {
            tr.setNodeMarkup(editData.pos!, undefined, { ...node.attrs, ...attrs });
            return true;
          });
          onClose();
          onCancelEdit?.();
          return;
        }
      } catch (err) {
        console.error('Edit product box failed', err);
      }
      // Fallback: delete and re-insert
      editor.commands.deleteRange({ from: editData.pos, to: editData.pos + 1 });
    }

    editor.chain().focus().insertContent({ type: 'productBox', attrs }).run();
    onClose();
    onCancelEdit?.();
  }, [editor, selectedId, finalTitle, finalPrice, finalImageUrl, finalLinkUrl, editData, onClose, onCancelEdit]);

  const handleDelete = useCallback(() => {
    if (editData && editData.pos !== null && editData.pos !== undefined) {
      try {
        editor.commands.deleteRange({ from: editData.pos, to: editData.pos + 1 });
        onClose();
        onCancelEdit?.();
      } catch {
        // ignore
      }
    }
  }, [editor, editData, onClose, onCancelEdit]);

  if (!isOpen) return null;

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 w-[400px] max-h-[480px] overflow-y-auto rounded-2xl border border-pgreen/20 bg-white shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      <div className="sticky top-0 bg-cream/60 backdrop-blur px-4 py-3 border-b border-pgreen/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-pgreen/10 flex items-center justify-center">
          <Package size={16} className="text-pgreen" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">
            {editData ? 'Chỉnh sửa hộp sản phẩm' : 'Chèn hộp sản phẩm'}
          </div>
          <div className="text-xs text-gray-500">
            {editData ? 'Sửa hoặc xóa khối sản phẩm trong bài' : 'Chọn sản phẩm để gắn vào bài viết'}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm của bạn..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pgreen/30 focus:border-pgreen outline-none"
          />
        </div>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* Product list */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {loading ? (
            <div className="text-xs text-gray-500 py-4 text-center">Đang tải sản phẩm...</div>
          ) : filtered.length === 0 ? (
            <div className="text-xs text-gray-500 py-4 text-center">
              {products.length === 0
                ? 'Bạn chưa có sản phẩm nào. Hãy tạo sản phẩm ở tab Sản phẩm trước.'
                : 'Không tìm thấy sản phẩm phù hợp.'}
            </div>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setManualTitle('');
                  setManualPrice('');
                  setManualImageUrl('');
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors ${
                  selectedId === p.id
                    ? 'border-pgreen bg-pgreen/10 shadow-sm'
                    : 'border-gray-150 bg-white hover:bg-gray-50 border-gray-200'
                }`}
              >
                {p.productImages?.[0] ? (
                  <img src={p.productImages[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <Package size={16} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{p.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {formatVND(p.minAmount)} đ{p.maxAmount ? ` (giá gốc ${formatVND(p.maxAmount)} đ)` : ''}
                    {p.campaignTitle ? ` • ${p.campaignTitle}` : ''}
                  </div>
                </div>
                {selectedId === p.id && (
                  <span className="text-pgreen text-xs font-bold">✓ Đã chọn</span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">hoặc nhập thủ công</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Manual fields */}
        <div className="space-y-2">
          <input
            type="text"
            value={manualTitle}
            onChange={e => { setManualTitle(e.target.value); setSelectedId(null); }}
            placeholder="Tên sản phẩm"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pgreen/30 focus:border-pgreen outline-none"
          />
          <input
            type="text"
            value={manualPrice}
            onChange={e => { setManualPrice(e.target.value); setSelectedId(null); }}
            placeholder="Giá sản phẩm (đ)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pgreen/30 focus:border-pgreen outline-none"
          />
          <input
            type="text"
            value={manualImageUrl}
            onChange={e => setManualImageUrl(e.target.value)}
            placeholder="URL ảnh sản phẩm (không bắt buộc)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pgreen/30 focus:border-pgreen outline-none"
          />
          <input
            type="text"
            value={manualLinkUrl}
            onChange={e => setManualLinkUrl(e.target.value)}
            placeholder="Link sản phẩm (để trống = link tự động)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pgreen/30 focus:border-pgreen outline-none"
          />
        </div>

        {/* Preview */}
        {(finalTitle || finalImageUrl) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-500 mb-2">Xem trước</div>
            <div className="product-box-preview bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
              {finalImageUrl ? (
                <img src={finalImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package size={20} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{finalTitle || 'Tên sản phẩm'}</div>
                {finalPrice && (
                  <div className="text-sm font-bold text-pgreen mt-0.5">
                    {formatVND(finalPrice)} đ
                  </div>
                )}
              </div>
              <div className="bg-pgreen text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                Xem sản phẩm
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-pgreen text-white text-sm font-semibold rounded-xl hover:bg-pgreen/90 transition-colors"
          >
            <Plus size={15} />
            {editData ? 'Cập nhật' : 'Chèn vào bài viết'}
          </button>
          {editData && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors"
              title="Xóa hộp sản phẩm"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
