'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface EmojiCategory {
    id: string;
    label: string;
    icon: string;
    emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
    {
        id: 'smileys',
        label: 'Cảm xúc',
        icon: '😀',
        emojis: [
            '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
            '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
            '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
            '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒',
            '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
            '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳',
            '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟', '🙁', '☹️', '😮',
            '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥',
            '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱',
            '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡',
        ],
    },
    {
        id: 'gestures',
        label: 'Cử chỉ',
        icon: '👍',
        emojis: [
            '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👏', '🙌',
            '🫶', '👐', '🤝', '🙏', '✍️', '💪', '🤌', '🤏', '👊', '✊',
            '👋', '🤚', '🖐️', '✋', '🖖', '👆', '👇', '👈', '👉', '☝️',
            '🤞', '🤘', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🤲', '🤝',
        ],
    },
    {
        id: 'hearts',
        label: 'Tình yêu',
        icon: '❤️',
        emojis: [
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️',
            '💕', '💗', '💖', '💘', '💝', '😻', '💑', '💏', '🌹', '💐',
            '🥀', '💒', '💍', '💌', '🎁', '💝', '🫂', '💞', '🥰', '😍',
        ],
    },
    {
        id: 'celebration',
        label: 'Kỷ niệm',
        icon: '🎉',
        emojis: [
            '💯', '💢', '💥', '💫', '✨', '🎉', '🎊', '🔥', '⭐', '🌟',
            '🎈', '🎂', '🎄', '🎃', '🎆', '🎇', '🧨', '🪅', '🎗️', '🏆',
            '🥇', '🥈', '🥉', '🎖️', '🎀', '🎐', '🎏', '🪄', '⚡', '💫',
        ],
    },
    {
        id: 'animals',
        label: 'Động vật',
        icon: '🐶',
        emojis: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔',
            '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴',
            '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗',
        ],
    },
    {
        id: 'food',
        label: 'Đồ ăn',
        icon: '🍔',
        emojis: [
            '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
            '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🫑',
            '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞',
            '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖',
            '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯',
            '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣',
        ],
    },
    {
        id: 'activities',
        label: 'Hoạt động',
        icon: '⚽',
        emojis: [
            '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
            '🏓', '🏸', '🥅', '🏒', '🏑', '🥍', '🏏', '🪃', '🥊', '🥋',
            '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🏋️',
            '🧘', '🤺', '🤼', '🤸', '⛹️', '🤾', '🏌️', '🏇', '🧗', '🚵',
            '🎮', '🕹️', '🎲', '🧩', '🪀', '🪁', '🎯', '🎳', '🎪', '🎭',
        ],
    },
    {
        id: 'travel',
        label: 'Du lịch',
        icon: '✈️',
        emojis: [
            '✈️', '🚀', '🛸', '🚁', '⛵', '🚢', '🚂', '🚆', '🚇', '🚌',
            '🚗', '🚕', '🚙', '🛺', '🚲', '🛵', '🏍️', '🛻', '🚜', '🚤',
            '🗺️', '🧭', '⛰️', '🌋', '🏔️', '🗻', '🏕️', '🏖️', '🏝️', '🏜️',
            '🌅', '🌄', '🌠', '🌌', '🎡', '🎢', '🎠', '⛲', '🏰', '🗽',
        ],
    },
    {
        id: 'objects',
        label: 'Đồ vật',
        icon: '💡',
        emojis: [
            '💡', '🔦', '🕯️', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷',
            '🪙', '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '🛠️', '⛏️',
            '🪛', '🔩', '⚙️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️',
            '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿',
            '💈', '⚗️', '🔭', '🔬', '🕳️', '💊', '💉', '🩸', '🩹', '🩺',
        ],
    },
    {
        id: 'symbols',
        label: 'Biểu tượng',
        icon: '✅',
        emojis: [
            '✅', '❌', '⭕', '🚫', '💯', '🔴', '🟠', '🟡', '🟢', '🔵',
            '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻',
            '💠', '🔘', '🔳', '🔲', '❤️', '🧡', '💛', '💚', '💙', '💜',
            '🖤', '🤍', '🤎', '💔', '❗', '❓', '‼️', '⁉️', '💬', '👁️‍🗨️',
            '♻️', '⚜️', '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '❎',
        ],
    },
    {
        id: 'flags',
        label: 'Cờ',
        icon: '🏳️',
        emojis: [
            '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️',
        ],
    },
];

interface EmojiPickerProps {
    /** Callback khi chọn emoji */
    onSelect: (emoji: string) => void;
    /** Vị trí đặt picker, mặc định 'top' */
    position?: 'top' | 'bottom';
}

/**
 * EmojiPicker — bảng chọn emoji đầy đủ:
 * - Ô tìm kiếm emoji theo tên tiếng Việt
 * - 11 danh mục có icon + thanh cuộn riêng
 * - Phần "Gần đây" lưu 24 emoji dùng gần nhất (localStorage)
 * - Nhấn ESC để đóng
 */
export function EmojiPicker({ onSelect, position = 'top' }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState('smileys');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const pickerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Tải emoji gần đây từ localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem('tutefund_recent_emojis');
            if (stored) setRecentEmojis(JSON.parse(stored));
        } catch {
            // ignore
        }
    }, []);

    // Đóng picker khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                // Chỉ đóng khi click ra ngoài — component cha sẽ tắt state khi nhận callback
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ESC để đóng (thông báo cha qua onSelect special value không dùng — cha tự quản state)
    useEffect(() => {
        function handleEsc(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                pickerRef.current?.dispatchEvent(new CustomEvent('emoji-picker-escape'));
            }
        }
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const saveRecent = (emoji: string) => {
        const updated = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 24);
        setRecentEmojis(updated);
        try {
            localStorage.setItem('tutefund_recent_emojis', JSON.stringify(updated));
        } catch {
            // ignore
        }
    };

    const handleSelect = (emoji: string) => {
        saveRecent(emoji);
        onSelect(emoji);
    };

    // Lọc emoji theo tìm kiếm (theo keywords tiếng Việt + mã emoji)
    const searchKeywords: Record<string, string> = {
        '😀': 'cuoi vui happy face', '😃': 'cuoi vui grin', '😄': 'cuoi vui', '😁': 'cuoi',
        '😆': 'cuoi lon', '😅': 'cuoi moi', '🤣': 'cuoi nhieu', '😂': 'cuoi khoc', '🙂': 'cuoi nhe',
        '🙃': 'cuoi nguoc', '😉': 'nham mat', '😊': 'cuoi ngai ngung', '😇': 'thien than',
        '🥰': 'yeu thuong', '😍': 'mat tim', '🤩': 'nguong mo', '😘': 'hon gio', '😗': 'hon',
        '😚': 'hon nham mat', '😙': 'hon', '🥲': 'cuoi cam dong', '😋': 'ngon', '😛': 'luoi',
        '😜': 'nham mat luoi', '🤪': 'dien', '😝': 'nham mat luoi lon', '🤑': 'tien',
        '🤗': 'om', '🤭': 'cuoi che', '🤫': 'im lang', '🤔': 'suy nghi', '🫡': 'nghiem trang',
        '🤐': 'khoa mieng', '🤨': 'hoai nghi', '😐': 'vo cam', '😑': 'vo tri', '😶': 'khong noi',
        '🫥': 'an mat', '😏': 'cuoi deu', '😒': 'kham phuc', '🙄': 'lat mat', '😬': 'rang',
        '🤥': 'noi doi', '😌': 'nhe nho', '😔': 'buon', '😪': 'buon ngu', '🤤': 'nho dai',
        '😴': 'ngu', '😷': 'khau trang', '🤒': 'om', '🤕': 'banh dau', '🤢': 'buon non',
        '🤮': 'non', '🥵': 'nong', '🥶': 'lanh', '🥴': 'say', '😵': 'choang', '🤯': 'soc',
        '🤠': 'cao boi', '🥳': 'tiec tung', '🥸': 'gia trang', '😎': 'mat kinh', '🤓': 'mot sach',
        '🧐': 'kinh luyp', '😕': 'boi roi', '🫤': 'bat man', '😟': 'lo lang', '🙁': 'hơi buon',
        '☹️': 'buon', '😮': 'ngac nhien', '😯': 'ua', '😲': 'so', '😳': 'mat do', '🥺': 'do ho',
        '🥹': 'cam dong', '😦': 'buon', '😧': 'lo lang', '😨': 'so hai', '😰': 'hoang mang',
        '😥': 'that vong', '😢': 'khoc', '😭': 'khoc nhieu', '😱': 'so hai', '😖': 'phien',
        '😣': 'kho chiu', '😞': 'that vong', '😓': 'mo hoi', '😩': 'met moi', '😫': 'kiet suc',
        '🥱': 'ngap ngun', '😤': 'huc huc', '😡': 'gian du', '😠': 'tuc giu', '🤬': 'chui rua',
        '😈': 'quy', '👿': 'ac quy', '💀': ' dau lau', '☠️': 'chet', '💩': 'cut', '🤡': 'he',
        '👍': 'like tot', '👎': 'dislike', '👌': 'ok', '✌️': 'hòa binh', '🤞': 'cau may',
        '🤟': 'yeu ban', '🤘': 'rock', '🤙': 'goi dien', '👏': 'v tay', '🙌': 'ho hoan',
        '🫶': 'yeu thuong', '👐': 'mo tay', '🤝': 'bat tay', '🙏': 'cam on', '✍️': 'viet',
        '💪': 'manh me', '❤️': 'yeu', '🧡': 'yeu cam', '💛': 'yeu vang', '💚': 'yeu xanh',
        '💙': 'yeu xanh duong', '💜': 'yeu tim', '🖤': 'den', '🤍': 'trang', '💔': 'vo',
        '❣️': 'yeu', '💕': 'hai trai tim', '💗': 'tim nhap', '💖': 'tim long lanh',
        '💘': 'ten ban', '💝': 'qua tang', '💯': '100 diem', '💢': 'giuan', '💥': 'no',
        '💫': 'choi', '✨': 'lanh', '🎉': 'pha hoa', '🎊': 'kenh', '🔥': 'lua', '⭐': 'sao',
    };

    const getEmojiKeywords = (emoji: string): string => {
        return searchKeywords[emoji] ?? '';
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();

    // Kết quả tìm kiếm: tìm trong tất cả danh mục
    const searchResults: string[] = (() => {
        if (!normalizedQuery) return [];
        const seen = new Set<string>();
        const out: string[] = [];
        for (const cat of EMOJI_CATEGORIES) {
            for (const emoji of cat.emojis) {
                const kw = getEmojiKeywords(emoji);
                if (!seen.has(emoji) && kw.includes(normalizedQuery)) {
                    seen.add(emoji);
                    out.push(emoji);
                }
            }
        }
        return out;
    })();

    const activeCat = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);

    return (
        <div
            ref={pickerRef}
            className={`z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden ${position === 'top' ? 'mb-2' : 'mt-2'}`}
        >
            {/* Header + tìm kiếm */}
            <div className="p-2 border-b border-gray-100">
                <Input
                    ref={searchRef}
                    placeholder="Tìm emoji... (vd: yêu, cười, cảm ơn)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                />
            </div>

            {/* Danh mục */}
            <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-gray-100 bg-gray-50">
                {EMOJI_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        title={cat.label}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-shrink-0 h-8 w-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                            activeCategory === cat.id && !normalizedQuery
                                ? 'bg-primary/15 ring-1 ring-primary/30'
                                : 'hover:bg-gray-200/70'
                        }`}
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>

            {/* Danh sách emoji */}
            <ScrollArea className="h-72">
                <div className="p-2">
                    {normalizedQuery ? (
                        searchResults.length > 0 ? (
                            <div className="grid grid-cols-8 gap-0.5">
                                {searchResults.map((emoji, i) => (
                                    <button
                                        key={`search-${emoji}-${i}`}
                                        type="button"
                                        className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                        onClick={() => handleSelect(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-6">
                                Không tìm thấy emoji phù hợp
                            </p>
                        )
                    ) : (
                        <>
                            {/* Gần đây */}
                            {activeCategory === 'smileys' && recentEmojis.length > 0 && (
                                <div className="mb-2">
                                    <p className="text-xs font-medium text-gray-500 px-1 mb-1">Gần đây</p>
                                    <div className="grid grid-cols-8 gap-0.5">
                                        {recentEmojis.map((emoji, i) => (
                                            <button
                                                key={`recent-${emoji}-${i}`}
                                                type="button"
                                                className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                                onClick={() => handleSelect(emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-b border-gray-100 my-2" />
                                </div>
                            )}

                            {/* Danh mục hiện tại */}
                            {activeCat && (
                                <>
                                    <p className="text-xs font-medium text-gray-500 px-1 mb-1">{activeCat.label}</p>
                                    <div className="grid grid-cols-8 gap-0.5">
                                        {activeCat.emojis.map((emoji, i) => (
                                            <button
                                                key={`${activeCat.id}-${emoji}-${i}`}
                                                type="button"
                                                className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                                onClick={() => handleSelect(emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
