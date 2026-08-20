'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageReaction as MessageReactionType } from '@/types/chat.types';

/** Các emoji phổ biến cho phản ứng nhanh */
export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '👏'];

interface ReactionRowProps {
    reactions?: MessageReactionType[];
    currentUserId: string;
    messageId: string;
    onToggleReaction: (messageId: string, emoji: string) => void;
    /** Bubble của tin nhắn người hiện tại để căn vị trí nút reaction */
    alignment: 'left' | 'right';
}

/**
 * ReactionPicker — menu 8 emoji phổ biến hiện khi hover vào bong bóng tin nhắn
 * hoặc khi bấm vào nút phản ứng
 */
function ReactionPicker({
    onSelect,
    onClose,
    alignment,
}: {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    alignment: 'left' | 'right';
}) {
    return (
        <div
            className={cn(
                'absolute -top-11 z-40 flex items-center gap-0.5 rounded-full bg-white border border-gray-200 shadow-lg px-1.5 py-1 animate-in fade-in zoom-in-95 duration-150',
                alignment === 'right' ? 'right-0' : 'left-0'
            )}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {QUICK_REACTIONS.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    title={emoji}
                    onClick={() => {
                        onSelect(emoji);
                        onClose();
                    }}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-full transition-transform hover:scale-125"
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
}

/**
 * ReactionRow — vùng chứa phản ứng hiển thị dưới bong bóng tin nhắn + nút "+"
 * Click vào pill emoji hiện có → toggle phản ứng đó; nút "+" → mở picker
 */
export function ReactionRow({
    reactions,
    currentUserId,
    messageId,
    onToggleReaction,
    alignment,
}: ReactionRowProps) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const list = (reactions || []).filter((r) => r.emoji && r.userIds && r.userIds.length > 0);

    // Luôn hiển thị nút "👍+" để người dùng luôn biết có thể thả cảm xúc
    // (kể cả khi chưa có phản ứng nào), giống Messenger/Zalo
    if (!pickerOpen && list.length === 0) {
        return (
            <div className={cn('relative inline-flex items-center gap-1 mt-1', alignment === 'right' ? 'ml-auto' : '')} onPointerDown={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    title="Thả cảm xúc"
                    aria-label="Thả cảm xúc"
                    onClick={() => setPickerOpen(true)}
                    className="inline-flex items-center justify-center h-6 min-w-6 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 text-xs px-1 transition-colors"
                >
                    <span className="text-sm leading-none">👍</span>
                    <span className="text-[10px] font-semibold ml-0.5">+</span>
                </button>
            </div>
        );
    }
    if (list.length === 0) return null;

    return (
        <div
            className={cn('relative inline-flex items-center gap-1 mt-1', alignment === 'right' ? 'ml-auto' : '')}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Nút thêm phản ứng */}
            <button
                type="button"
                title="Thả cảm xúc"
                onClick={() => setPickerOpen((v) => !v)}
                className="inline-flex items-center justify-center h-7 min-w-7 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 text-xs px-1 transition-colors"
            >
                <span className="text-sm leading-none">👍</span>
                <span className="text-[10px] font-semibold ml-0.5">+</span>
            </button>

            {/* Picker emoji phổ biến */}
            {pickerOpen && (
                <ReactionPicker
                    alignment={alignment}
                    onSelect={(emoji) => {
                        onToggleReaction(messageId, emoji);
                        setPickerOpen(false);
                    }}
                    onClose={() => setPickerOpen(false)}
                />
            )}

            {/* Các pill phản ứng đã có */}
            {list.map((reaction) => {
                const mine = reaction.userIds.includes(currentUserId);
                return (
                    <button
                        key={reaction.emoji}
                        type="button"
                        title={`${reaction.emoji} ${reaction.userIds.length} — bấm để bỏ/bật phản ứng`}
                        onClick={() => onToggleReaction(messageId, reaction.emoji)}
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                            mine
                                ? 'bg-blue-100 border-blue-400 ring-1 ring-blue-200'
                                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        )}
                    >
                        <span className="text-sm leading-none">{reaction.emoji}</span>
                        <span className="font-semibold">{reaction.userIds.length}</span>
                    </button>
                );
            })}
        </div>
    );
}
