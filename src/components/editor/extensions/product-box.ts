/**
 * Product Box Extension
 * Inline product card node for blog posts: image + name + price + CTA button
 * HTML format: <div data-type="product-box" data-reward-id="..." data-title="..."
 *   data-price="..." data-image-url="..." data-link-url="..."></div>
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

export interface ProductBoxAttributes {
  rewardId: string | null;
  title: string;
  price: string;
  imageUrl: string | null;
  linkUrl: string | null;
  campaignId?: string | null;
  isPreorder?: boolean;
  deliveryDate?: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertProductBox: (attrs: ProductBoxAttributes) => ReturnType;
  }
}

function escapeAttr(value: string | null): string {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const ProductBox = Node.create({
  name: 'productBox',

  group: 'block',

  draggable: true,

  inline: false,

  addAttributes() {
    return {
      rewardId: {
        default: null,
        parseHTML: element => element.getAttribute('data-reward-id') || null,
        renderHTML: attributes =>
          attributes.rewardId ? { 'data-reward-id': attributes.rewardId } : {},
      },
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-title') || '',
        renderHTML: attributes => (attributes.title ? { 'data-title': attributes.title } : {}),
      },
      price: {
        default: '',
        parseHTML: element => element.getAttribute('data-price') || '',
        renderHTML: attributes => (attributes.price ? { 'data-price': attributes.price } : {}),
      },
      imageUrl: {
        default: null,
        parseHTML: element => element.getAttribute('data-image-url') || null,
        renderHTML: attributes =>
          attributes.imageUrl ? { 'data-image-url': attributes.imageUrl } : {},
      },
      linkUrl: {
        default: null,
        parseHTML: element => element.getAttribute('data-link-url') || null,
        renderHTML: attributes =>
          attributes.linkUrl ? { 'data-link-url': attributes.linkUrl } : {},
      },
      campaignId: {
        default: null,
        parseHTML: element => element.getAttribute('data-campaign-id') || null,
        renderHTML: attributes =>
          attributes.campaignId ? { 'data-campaign-id': attributes.campaignId } : {},
      },
      isPreorder: {
        default: false,
        parseHTML: element => element.getAttribute('data-is-preorder') === 'true',
        renderHTML: attributes => attributes.isPreorder ? { 'data-is-preorder': 'true' } : {},
      },
      deliveryDate: {
        default: null,
        parseHTML: element => element.getAttribute('data-delivery-date') || null,
        renderHTML: attributes => attributes.deliveryDate ? { 'data-delivery-date': attributes.deliveryDate } : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="product-box"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'product-box',
        class: 'product-box',
      }),
      0,
    ];
  },

  addCommands(): Record<string, unknown> {
    return {
      insertProductBox:
        (attrs: ProductBoxAttributes) =>
        (helpers: { commands: any }) => {
          return helpers.commands.insertContent({
            type: 'productBox',
            attrs,
          });
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { rewardId, title, price, imageUrl, linkUrl, campaignId, isPreorder, deliveryDate } = node.attrs as ProductBoxAttributes;

      const container = document.createElement('div');
      container.className =
        'product-box-editor my-4 rounded-xl border-2 border-dashed border-green-300 bg-green-50/50 p-4 select-none';

      // Header
      const header = document.createElement('div');
      header.className = 'flex items-center gap-2 mb-3';
      const badge = document.createElement('span');
      badge.className =
        'inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full';
      badge.textContent = '📦 Hộp sản phẩm';
      header.appendChild(badge);

      if (!editor.isEditable) {
        container.appendChild(header);
        return { dom: container };
      }

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className =
        'ml-auto text-xs font-medium text-green-700 bg-white border border-green-200 px-3 py-1 rounded-md hover:bg-green-100 transition-colors';
      editBtn.textContent = 'Chỉnh sửa / Xóa';
      editBtn.onmousedown = e => {
        e.preventDefault();
        // Select this node
        if (typeof getPos === 'function') {
          const pos = getPos();
          editor.commands.setNodeSelection(pos);
        }
        // Dispatch custom event handled by ProductionEditor
        window.dispatchEvent(
          new CustomEvent('productbox:edit', {
            detail: {
              rewardId,
              title,
              price,
              imageUrl,
                                                      linkUrl,
                                                      campaignId,
                                                      isPreorder,
                                                      deliveryDate,
                                                      pos: typeof getPos === 'function' ? getPos() : null,
            },
          })
        );
      };
      header.appendChild(editBtn);
      container.appendChild(header);

      // Preview row
      const row = document.createElement('div');
      row.className = 'flex items-center gap-4';

      if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'w-20 h-20 object-cover rounded-lg border border-gray-200';
        row.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center';
        placeholder.textContent = '📦';
        row.appendChild(placeholder);
      }

      const info = document.createElement('div');
      info.className = 'flex-1 min-w-0';
      const name = document.createElement('div');
      name.className = 'font-semibold text-gray-900 truncate';
      name.textContent = title || '(Chưa đặt tên)';
      const priceEl = document.createElement('div');
      priceEl.className = 'text-sm text-green-600 font-bold mt-1';
      priceEl.textContent = price ? `${price} đ` : '(Chưa có giá)';
      info.appendChild(name);
      info.appendChild(priceEl);
      row.appendChild(info);

      container.appendChild(row);
      return { dom: container };
    };
  },
});
