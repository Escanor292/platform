'use client';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Send,
    Paperclip,
    Image as ImageIcon,
    Smile,
    MoreVertical,
    Phone,
    Video,
    Info,
    Mic,
    Search,
    Loader2,
    Trash2,
    Flag,
    Ban,
    X,
    Lock,
    ChevronDown,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ProductMessageCard, parseProductSegments } from './ProductMessageCard';
import { EmojiPicker } from './EmojiPicker';
import ReportEvidenceFields from '@/components/report/ReportEvidenceFields';
import { ReactionRow } from './MessageReaction';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MongoMessage, MessageAttachment } from '@/types/chat.types';

interface ChatWindowProps {
    conversationId: string;
    recipientName: string;
    recipientAvatar?: string;
    recipientUserId?: string;
    /** Tài khoản đối phương đã bị xóa khỏi hệ thống */
    recipientDeleted?: boolean;
    messages: MongoMessage[];
    currentUserId: string;
    currentUserName?: string;
    currentAvatar?: string;
    onSendMessage: (content: string, attachments?: File[], sensitive?: boolean) => void;
    onStartCall?: (callType: 'voice' | 'video') => void;
    isOnline?: boolean;
    onToggleInfoPanel?: () => void;
    showInfoPanel?: boolean;
    typingUsers?: string[];
    onLoadMore?: () => void;
    hasMore?: boolean;
    onMessagesUpdate?: (updated: MongoMessage[]) => void;
    loading?: boolean;
}

/** Đổi URL trần trong text thành link bấm được */
function linkifyText(text: string) {
    const urlRegex = /\b(https?:\/\/[^\s<>"']+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
        urlRegex.test(part) ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
            >
                {part}
            </a>
        ) : (
            <span key={i}>{part}</span>
        )
    );
}

/** Render nội dung tin nhắn: phân tách thẻ sản phẩm thành ProductMessageCard */
function renderMessageText(text: string) {
    return parseProductSegments(text).map((seg, i) =>
        seg.type === 'product' ? (
            <ProductMessageCard key={`product-${i}`} data={seg.data} className="my-1" />
        ) : (
            <p key={`text-${i}`} className="text-sm whitespace-pre-wrap break-words">
                {linkifyText(seg.content)}
            </p>
        )
    );
}

interface ReportReason {
    value: string;
    label: string;
}

const REPORT_REASONS: ReportReason[] = [
    { value: 'spam', label: 'Spam / Quảng cáo' },
    { value: 'harassment', label: 'Quấy rối / Bắt nạt' },
    { value: 'inappropriate', label: 'Nội dung không phù hợp' },
    { value: 'scam', label: 'Lừa đảo' },
    { value: 'other', label: 'Lý do khác' },
];

// Bảng chọn emoji render qua Portal vào body để không bị cắt bởi overflow của khung chat
function EmojiPickerPortal({
    inputRef,
    onClose,
    onSelect,
}: {
    inputRef: React.RefObject<HTMLDivElement | null>;
    onClose: () => void;
    onSelect: (emoji: string) => void;
}) {
    const [pos, setPos] = useState<{ bottom: number; right: number } | null>(null);

    const update = useCallback(() => {
        if (inputRef.current) {
            const r = inputRef.current.getBoundingClientRect();
            const GAP = 8;
            // Bảng emoji bám ngay phía trên ô nhập, không có khoảng trống
            const bottom = Math.max(window.innerHeight - r.top + GAP, 40);
            setPos({ bottom, right: window.innerWidth - r.right + 16 });
        }
    }, [inputRef]);

    // Cập nhật vị trí ngay sau khi mount xong layout (sau 1 khung hình) và khi cuộn/thay đổi cỡ
    useEffect(() => {
        const raf = requestAnimationFrame(update);
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        const interval = setInterval(update, 300);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
            clearInterval(interval);
        };
    }, [update]);

    if (!pos) return null;
    return createPortal(
        <div
            className="fixed z-[100] animate-in fade-in zoom-in-95 duration-150"
            style={{ bottom: pos.bottom, right: pos.right }}
            onPointerDown={(e) => {
                // Chọn nhiều emoji liên tục: bảng KHÔNG tự tắt khi bấm vào nút emoji.
                // Chỉ đóng khi click vào nền trống của bảng (không phải button).
                const target = e.target as HTMLElement;
                const isEmojiButton = !!target.closest('button');
                if (isEmojiButton) {
                    e.stopPropagation();
                    // Không đóng — người dùng có thể tiếp tục chọn emoji tiếp theo
                } else {
                    e.stopPropagation();
                    onClose();
                }
            }}
        >
            <EmojiPicker position="top" onSelect={onSelect} onClose={onClose} />
        </div>,
        document.body
    );
}

export function ChatWindow({
    conversationId,
    recipientName,
    recipientAvatar,
    recipientUserId,
    recipientDeleted = false,
    messages,
    currentUserId,
    currentUserName,
    currentAvatar,
    onSendMessage,
    onStartCall,
    isOnline,
    onToggleInfoPanel,
    showInfoPanel,
    typingUsers = [],
    onLoadMore,
    hasMore = false,
    onMessagesUpdate,
    loading = false,
}: ChatWindowProps) {
    const router = useRouter();

    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MongoMessage[]>([]);
    const [searching, setSearching] = useState(false);
    const [isSensitive, setIsSensitive] = useState(false);

    // Attachment states
    const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Emoji picker state
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleToggleReaction = async (messageId: string, emoji: string) => {
        try {
            const response = await fetch(
                `/api/chat/conversations/${conversationId}/messages/${messageId}/reaction`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emoji }),
                }
            );
            if (!response.ok) return;
            const data = await response.json();
            // Cập nhật cục bộ để hiển thị ngay
            const updatedMessages = messages.map((m) =>
                m._id?.toString() === messageId ? { ...m, reactions: data.reactions } : m
            );
            if (onMessagesUpdate) {
                onMessagesUpdate(updatedMessages);
            }
        } catch {
            // Bỏ qua lỗi phản ứng
        }
    };

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Report dialog state
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [reportReason, setReportReason] = useState('spam');
    const [reportDescription, setReportDescription] = useState('');
    const [reportOccurredAt, setReportOccurredAt] = useState('');
    const [reportImages, setReportImages] = useState<string[]>([]);
    const [reporting, setReporting] = useState(false);

    // Block confirmation state
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [blocking, setBlocking] = useState(false);

    // Delete confirmation state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    // Theo dõi conversationId để biết khi nào mở cuộc trò chuyện mới
    const prevConversationIdRef = useRef<string | null>(null);
    const [showNewMessageNotice, setShowNewMessageNotice] = useState(false);
    const prevMessagesCountRef = useRef(messages.length);

    // Khi mở cuộc trò chuyện mới, chỉ cuộn sau khi dữ liệu đã tải xong.
    // Tin nhắn mới đến trong cuộc trò chuyện đang mở vẫn giữ nguyên vị trí người dùng đang xem.
    useEffect(() => {
        const scrollArea = scrollAreaRef.current;
        if (!scrollArea || loading) return;

        const isNewConversation = prevConversationIdRef.current !== conversationId;
        if (isNewConversation) {
            prevConversationIdRef.current = conversationId;
            prevMessagesCountRef.current = messages.length;
            setShowNewMessageNotice(false);

            // Chờ layout hoàn tất (bao gồm thẻ sản phẩm/hình ảnh) rồi mới cuộn xuống đáy.
            requestAnimationFrame(() => {
                const currentScrollArea = scrollAreaRef.current;
                if (!currentScrollArea) return;
                currentScrollArea.scrollTop = currentScrollArea.scrollHeight;
                requestAnimationFrame(() => {
                    if (scrollAreaRef.current) {
                        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                    }
                });
            });
            return;
        }

        // Có tin mới trong cuộc trò chuyện đang mở: chỉ báo nếu người dùng đang xem tin cũ.
        if (messages.length > prevMessagesCountRef.current) {
            prevMessagesCountRef.current = messages.length;
            const isNearBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight < 150;
            if (!isNearBottom) {
                setShowNewMessageNotice(true);
            }
            return;
        }
        prevMessagesCountRef.current = messages.length;
    }, [messages, conversationId, loading]);

    // Cuộn xuống cuối danh sách khi bấm "Có tin nhắn mới"
    const scrollToNewMessages = () => {
        const scrollArea = scrollAreaRef.current;
        if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
        }
        setShowNewMessageNotice(false);
    };

    // Cleanup recording timer on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        };
    }, []);

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Format message time
    const formatMessageTime = (date: Date) => {
        return format(new Date(date), 'HH:mm', { locale: vi });
    };

    // Handle send message
    const handleSend = () => {
        if (messageText.trim() || pendingAttachments.length > 0) {
            onSendMessage(messageText.trim(), pendingAttachments.length > 0 ? pendingAttachments : undefined, isSensitive);
            setMessageText('');
            setIsSensitive(false);
            setPendingAttachments([]);
            textareaRef.current?.focus();
        }
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ─── Emoji picker ─────────────────────────────────────────────
    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setMessageText((prev) => prev + emoji);
            return;
        }
        const start = textarea.selectionStart ?? messageText.length;
        const end = textarea.selectionEnd ?? messageText.length;
        const newText = messageText.slice(0, start) + emoji + messageText.slice(end);
        setMessageText(newText);
        // Restore cursor position after state update
        requestAnimationFrame(() => {
            textarea.focus();
            const pos = start + emoji.length;
            textarea.setSelectionRange(pos, pos);
        });
    };

    // ─── File / image attachment ──────────────────────────────────
    const validateFile = (file: File): string | null => {
        if (file.size > 5 * 1024 * 1024) {
            return `File "${file.name}" quá lớn (tối đa 5MB)`;
        }
        return null;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const error = validateFile(file);
            if (error) {
                alert(error);
                continue;
            }
            newFiles.push(file);
        }

        if (newFiles.length > 0) {
            setPendingAttachments((prev) => [...prev, ...newFiles]);
        }
        // Reset input để có thể chọn lại cùng file
        e.target.value = '';
    };

    const removePendingAttachment = (index: number) => {
        setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── Voice recording ──────────────────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop());
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
                if (blob.size > 0) {
                    setPendingAttachments((prev) => [...prev, file]);
                }
            };

            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((t) => t + 1);
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('Không thể truy cập micro. Vui lòng cấp quyền truy cập micro trong trình duyệt.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
            chunksRef.current = [];
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
    };

    const formatRecordingTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ─── Search messages ──────────────────────────────────────────
    const handleSearchMessages = async (query: string) => {
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/messages/search?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.messages || []);
            }
        } catch (error) {
            console.error('Failed to search messages:', error);
        } finally {
            setSearching(false);
        }
    };

    // ─── Block user ───────────────────────────────────────────────
    const handleBlockUser = async () => {
        try {
            setBlocking(true);
            const response = await fetch(`/api/chat/conversations/${conversationId}/block`, {
                method: 'POST',
            });
            if (response.ok) {
                setShowBlockDialog(false);
                alert('Người dùng đã bị chặn. Cuộc trò chuyện này sẽ bị ẩn.');
                router.push('/chat');
            } else {
                const data = await response.json();
                alert(data.error || 'Không thể chặn người dùng');
            }
        } catch (err: any) {
            console.error('Block error:', err);
            alert(err.message || 'Không thể chặn người dùng');
        } finally {
            setBlocking(false);
        }
    };

    // ─── Report conversation ──────────────────────────────────────
    const handleReport = async () => {
        if (!reportDescription.trim()) {
            alert('Vui lòng mô tả lý do báo cáo');
            return;
        }
        try {
            setReporting(true);
            const response = await fetch(`/api/chat/conversations/${conversationId}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: reportReason,
                    description: reportDescription.trim(),
                    imageUrls: reportImages,
                    occurredAt: reportOccurredAt || null,
                }),
            });
            if (response.ok) {
                setShowReportDialog(false);
                setReportDescription('');
                setReportOccurredAt('');
                setReportImages([]);
                alert('Cảm ơn bạn đã báo cáo. Đội ngũ quản trị sẽ xem xét trong thời gian sớm nhất.');
            } else {
                const data = await response.json();
                alert(data.error || 'Không thể gửi báo cáo');
            }
        } catch (err: any) {
            console.error('Report error:', err);
            alert(err.message || 'Không thể gửi báo cáo');
        } finally {
            setReporting(false);
        }
    };

    // ─── Delete conversation ──────────────────────────────────────
    const handleDeleteConversation = async () => {
        try {
            setDeleting(true);
            const response = await fetch(`/api/chat/conversations/${conversationId}/delete`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setShowDeleteDialog(false);
                router.push('/chat');
            } else {
                const data = await response.json();
                alert(data.error || 'Không thể xóa cuộc trò chuyện');
            }
        } catch (err: any) {
            console.error('Delete error:', err);
            alert(err.message || 'Không thể xóa cuộc trò chuyện');
        } finally {
            setDeleting(false);
        }
    };

    // ─── Sensitive message reveal ────────────────────────────────
    const handleRevealMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}/messages/${messageId}/reveal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Không thể mở tin nhắn nhạy cảm');
                return;
            }
            // Cập nhật tin nhắn trong state thay vì reload toàn trang
            const updatedMessages = messages.map((m) => {
                if (m._id?.toString() === messageId) {
                    return { ...m, revealedBy: [...(m.revealedBy || []), currentUserId] };
                }
                return m;
            });
            onMessagesUpdate?.(updatedMessages);
            // Mở tin nhắn tại chỗ, không cuộn gì cả
        } catch (err: any) {
            console.error('Reveal error:', err);
            alert('Không thể mở tin nhắn nhạy cảm');
        }
    };

    // ─── Call buttons ───────────────────────
    const handleCall = (callType: 'voice' | 'video') => {
        onStartCall?.(callType);
    };

    // Group messages by date
    // Ẩn tin tín hiệu cuộc gọi (call-signal) khỏi giao diện chat — chỉ dùng làm kênh signaling
    const visibleMessages = useMemo(
        () => messages.filter((m) => m.type !== 'call-signal'),
        [messages]
    );
    const groupMessagesByDate = (messages: MongoMessage[]) => {
        const groups: { [key: string]: MongoMessage[] } = {};
        messages.forEach((message) => {
            const date = format(new Date(message.createdAt), 'dd/MM/yyyy', { locale: vi });
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });
        return groups;
    };

    const messageGroups = groupMessagesByDate(visibleMessages);

    return (
        <>
            <div className="flex h-full w-full flex-col min-h-0 min-w-0 bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {recipientUserId && !recipientDeleted ? (
                                    <Link href={`/profile/${recipientUserId}`} title={`Xem trang cá nhân của ${recipientName}`}>
                                        <Avatar className={`h-10 w-10 transition-transform hover:scale-105 ${recipientDeleted ? "grayscale opacity-60" : ""}`}>
                                            {recipientDeleted ? (
                                                <AvatarFallback className="bg-gray-200 text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                </AvatarFallback>
                                            ) : (
                                                <>
                                                    <AvatarImage src={recipientAvatar} alt={recipientName} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                                        {getInitials(recipientName)}
                                                    </AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        {isOnline && !recipientDeleted && (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                        )}
                                    </Link>
                                ) : (
                                    <>
                                        <Avatar className={`h-10 w-10 ${recipientDeleted ? "grayscale opacity-60" : ""}`}>
                                            {recipientDeleted ? (
                                                <AvatarFallback className="bg-gray-200 text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                                </AvatarFallback>
                                            ) : (
                                                <>
                                                    <AvatarImage src={recipientAvatar} alt={recipientName} />
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                                        {getInitials(recipientName)}
                                                    </AvatarFallback>
                                                </>
                                            )}
                                        </Avatar>
                                        {isOnline && !recipientDeleted && (
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                                        )}
                                    </>
                                )}
                            </div>
                            <div>
                                {recipientUserId && !recipientDeleted ? (
                                    <Link href={`/profile/${recipientUserId}`} className="hover:text-primary transition-colors">
                                        <h3 className={`font-semibold ${recipientDeleted ? "text-gray-400 italic" : "text-gray-900"}`}>{recipientName}</h3>
                                    </Link>
                                ) : (
                                    <h3 className={`font-semibold ${recipientDeleted ? "text-gray-400 italic" : "text-gray-900"}`}>{recipientName}</h3>
                                )}
                                <p className="text-xs text-gray-500">
                                    {recipientDeleted ? 'Tài khoản đã xóa' : isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                                </p>
                            </div>
                        </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => setShowSearchDialog(true)}
                            title="Tìm kiếm tin nhắn"
                        >
                            <Search className="h-5 w-5 text-gray-600" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleCall('voice')}
                            title="Gọi thoại"
                        >
                            <Phone className="h-5 w-5 text-gray-600" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={() => handleCall('video')}
                            title="Gọi video"
                        >
                            <Video className="h-5 w-5 text-gray-600" />
                        </Button>
                        {/* Menu gộp: Thông tin + các hành động cuộc trò chuyện */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "rounded-full transition-colors",
                                        showInfoPanel ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-600 hover:bg-gray-100"
                                    )}
                                    title={showInfoPanel ? "Đóng thông tin" : "Thông tin và tùy chọn"}
                                >
                                    <Info className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={onToggleInfoPanel}>
                                    <Info className="h-4 w-4 mr-2" />
                                    {showInfoPanel ? 'Đóng thông tin' : 'Xem thông tin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowSearchDialog(true)}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Tìm kiếm trong cuộc trò chuyện
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setShowReportDialog(true)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Flag className="h-4 w-4 mr-2" />
                                    Báo cáo cuộc trò chuyện
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowBlockDialog(true)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Chặn người dùng
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Xóa cuộc trò chuyện
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-4 relative" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {/* Load more button */}
                        {hasMore && onLoadMore && (
                            <div className="flex justify-center py-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onLoadMore}
                                    className="text-xs"
                                >
                                    Tải thêm tin nhắn
                                </Button>
                            </div>
                        )}
                        {Object.entries(messageGroups).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center justify-center my-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                        {date}
                                    </span>
                                </div>

                                {/* Messages for this date */}
                                {msgs.map((message, index) => {
                                    const isCurrentUser = message.senderId === currentUserId;
                                    const showAvatar =
                                        index === msgs.length - 1 ||
                                        msgs[index + 1]?.senderId !== message.senderId;
                                    const isRevealed = !message.sensitive || message.revealedBy?.includes(currentUserId);

                                    return (
                                        <div
                                            id={`message-bubble-${message._id?.toString()}`}
                                            key={message._id?.toString()}
                                            className={cn(
                                                'flex gap-2 mb-2',
                                                isCurrentUser ? 'justify-end' : 'justify-start'
                                            )}
                                        >
                                            <div className={cn('flex w-fit max-w-[70%] min-w-0 flex-col', isCurrentUser ? 'items-end' : 'items-start')}>
                                            {!isCurrentUser && (
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    {showAvatar ? (
                                                        <>
                                                            <AvatarImage src={recipientAvatar} alt={recipientName} />
                                                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                                                                {getInitials(recipientName)}
                                                            </AvatarFallback>
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full" />
                                                    )}
                                                </Avatar>
                                            )}

                                            <div
                                                className={cn(
                                                    'w-fit max-w-full break-words rounded-2xl px-4 py-2',
                                                    isCurrentUser
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                )}
                                            >
                                                {/* Attachments */}
                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="mb-2 space-y-2">
                                                        {message.attachments.map((attachment, idx) => (
                                                            <div key={idx}>
                                                                {attachment.type === 'image' && (
                                                                    <img
                                                                        src={attachment.url}
                                                                        alt={attachment.filename || 'Image'}
                                                                        className="rounded-lg max-w-full h-auto max-h-48 object-cover"
                                                                    />
                                                                )}
                                                                {attachment.type === 'file' && (
                                                                    <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2">
                                                                        <Paperclip className="h-4 w-4" />
                                                                        <span className="text-sm">{attachment.filename}</span>
                                                                    </div>
                                                                )}
                                                                {attachment.type === 'voice' && (
                                                                    <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2">
                                                                        <Mic className="h-4 w-4" />
                                                                        <span className="text-sm">
                                                                            {attachment.duration ? `${Math.floor(attachment.duration / 60)}:${(attachment.duration % 60).toString().padStart(2, '0')}` : 'Voice'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Text content */}
                                                {message.text && (isRevealed ? (
                                                    <div className={cn('space-y-1', isCurrentUser ? 'text-center' : 'text-left')}>
                                                        {renderMessageText(message.text)}
                                                        
                                                        {message.sensitive && isCurrentUser && (
                                                            <span className="inline-flex ml-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 align-middle">🔒 Nhạy cảm</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 bg-black/10 rounded-lg p-4 my-1">
                                                        <span className="text-lg">🔒</span>
                                                        <p className="text-xs text-gray-600">Tin nhắn nhạy cảm</p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs"
                                                            onClick={() => handleRevealMessage(message._id?.toString() || '')}
                                                        >
                                                            Nhấn để xem nội dung
                                                        </Button>
                                                    </div>
                                                ))}

                                            </div>

                                            {/* Timestamp and seen status — nằm ngoài bong bóng chat */}
                                            <div className={cn("flex items-center gap-1 mt-1", isCurrentUser ? "justify-end" : "justify-start")}>
                                                <p className="text-[10px] text-gray-400">
                                                    {formatMessageTime(message.createdAt)}
                                                </p>
                                                {isCurrentUser && message.readBy?.some(id => id !== currentUserId) && (
                                                    <span className="text-[10px] text-blue-500 font-medium">Đã xem</span>
                                                )}
                                            </div>

                                            {/* Reactions (thả cảm xúc) — nằm ngay dưới bong bóng tin nhắn */}
                                            <ReactionRow
                                                reactions={message.reactions}
                                                currentUserId={currentUserId}
                                                messageId={message._id?.toString() || ''}
                                                onToggleReaction={handleToggleReaction}
                                                alignment={isCurrentUser ? 'right' : 'left'}
                                            />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={recipientAvatar} alt={recipientName} />
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs">
                                        {getInitials(recipientName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <span
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.1s' }}
                                        />
                                        <span
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                        {/* Thông báo "Có tin nhắn mới" khi tin mới đến mà user đang cuộn lên trên */}
                        {showNewMessageNotice && (
                            <div className="flex justify-center py-2">
                                <button
                                    type="button"
                                    onClick={scrollToNewMessages}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-md ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronDown className="h-3.5 w-3.5" />
                                    Có tin nhắn mới
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending attachments preview */}
                {pendingAttachments.length > 0 && (
                    <div className="border-t px-4 py-2 flex-shrink-0">
                        <div className="flex flex-wrap gap-2 items-center">
                            {pendingAttachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="relative flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5"
                                >
                                    <span className="text-sm text-gray-700 max-w-[160px] truncate">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(0)}KB
                                    </span>
                                    <button
                                        onClick={() => removePendingAttachment(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Xóa tệp đính kèm"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div ref={inputContainerRef} className="border-t p-4 flex-shrink-0 relative">
                    {/* Hidden file inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        accept="*/*"
                        onChange={handleFileSelect}
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {/* Voice recording indicator */}
                    {isRecording && (
                        <div className="flex items-center gap-3 mb-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-sm font-medium text-red-600">
                                Đang ghi âm {formatRecordingTime(recordingTime)}
                            </span>
                            <div className="ml-auto flex gap-2">
                                <Button variant="outline" size="sm" onClick={cancelRecording}>
                                    Hủy
                                </Button>
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={stopRecording}>
                                    Gửi ghi âm
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full flex-shrink-0"
                                title="Đính kèm tệp"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <Paperclip className="h-5 w-5 text-gray-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full flex-shrink-0"
                                title="Đính kèm ảnh"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <ImageIcon className="h-5 w-5 text-gray-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "rounded-full flex-shrink-0",
                                    isRecording && "text-red-500"
                                )}
                                title={isRecording ? "Dừng ghi âm" : "Ghi âm"}
                                onClick={isRecording ? stopRecording : startRecording}
                            >
                                <Mic className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Nhập tin nhắn..."
                                className="min-h-[44px] max-h-32 resize-none pr-10"
                                rows={1}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "absolute right-2 bottom-1/2 translate-y-1/2 rounded-full",
                                    showEmojiPicker && "bg-gray-100"
                                )}
                                title="Emoji"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile className="h-5 w-5 text-gray-600" />
                            </Button>
                        </div>

                        <Button
                            variant={isSensitive ? "default" : "outline"}
                            size="icon"
                            className={cn(
                                "rounded-full flex-shrink-0 border-2 transition-all",
                                isSensitive
                                    ? "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-md ring-2 ring-red-200"
                                    : "bg-white border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
                            )}
                            onClick={() => setIsSensitive(!isSensitive)}
                            title={isSensitive ? "Bỏ đánh dấu nhạy cảm - tin nhắn gửi đi sẽ bị che, người nhận phải bấm để xem" : "Đánh dấu nhạy cảm - tin nhắn gửi đi sẽ bị che, người nhận phải bấm để xem"}
                        >
                            <Lock className="h-4 w-4" />
                        </Button>

                        <Button
                            onClick={handleSend}
                            disabled={(!messageText.trim() && pendingAttachments.length === 0) || uploading}
                            className="rounded-full h-11 w-11 p-0 flex-shrink-0 bg-primary hover:bg-primary/90"
                        >
                            {uploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Emoji picker — render qua portal vào body để không bị cắt bởi overflow của khung chat */}
                    {showEmojiPicker && (
                        <EmojiPickerPortal
                            inputRef={inputContainerRef}
                            onClose={() => setShowEmojiPicker(false)}
                            onSelect={(emoji) => {
                                // Chèn emoji vào ô nhập nhưng KHÔNG tắt bảng — cho phép chọn nhiều emoji liên tục.
                                // Bấm lại nút emoji để tắt bảng thủ công.
                                insertEmoji(emoji);
                            }}
                        />
                    )}
                </div>

                {/* Search Messages Dialog */}
                <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tìm kiếm tin nhắn</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearchMessages(e.target.value);
                                }}
                            />
                            <ScrollArea className="h-[300px]">
                                {searching ? (
                                    <div className="flex items-center justify-center py-8">
                                        <span className="text-gray-400 text-sm">Đang tìm kiếm...</span>
                                    </div>
                                ) : searchQuery.length < 2 ? (
                                    <p className="text-center text-gray-500 text-sm py-8">
                                        Nhập ít nhất 2 ký tự để tìm kiếm
                                    </p>
                                ) : searchResults.length === 0 ? (
                                    <p className="text-center text-gray-500 text-sm py-8">
                                        Không tìm thấy tin nhắn nào
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {searchResults.map((msg) => (
                                            <div
                                                key={msg._id?.toString()}
                                                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                                onClick={() => {
                                                    setShowSearchDialog(false);
                                                    // Scroll to message (implementation depends on parent)
                                                }}
                                            >
                                                <p className="text-sm text-gray-900 line-clamp-2">
                                                    {msg.text}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatMessageTime(msg.createdAt)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Report Dialog */}
                <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Flag className="h-5 w-5 text-red-500" />
                                Báo cáo cuộc trò chuyện
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Lý do báo cáo</label>
                                <div className="space-y-1">
                                    {REPORT_REASONS.map((reason) => (
                                        <label
                                            key={reason.value}
                                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="report-reason"
                                                value={reason.value}
                                                checked={reportReason === reason.value}
                                                onChange={() => setReportReason(reason.value)}
                                                className="accent-red-500"
                                            />
                                            <span className="text-sm text-gray-700">{reason.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Mô tả chi tiết <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    className="min-h-24"
                                />
                            </div>
                            <ReportEvidenceFields
                                occurredAt={reportOccurredAt}
                                onOccurredAtChange={setReportOccurredAt}
                                imageUrls={reportImages}
                                onImageUrlsChange={setReportImages}
                                disabled={reporting}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleReport}
                                disabled={reporting || !reportDescription.trim()}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {reporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    'Gửi báo cáo'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Block Confirmation Dialog */}
                <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Ban className="h-5 w-5 text-red-500" />
                                Chặn người dùng
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                                Bạn có chắc chắn muốn chặn <strong>{recipientName}</strong>?
                            </p>
                            <p className="text-sm text-gray-500">
                                Cuộc trò chuyện này sẽ bị ẩn và người dùng không thể gửi tin nhắn cho bạn nữa.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleBlockUser}
                                disabled={blocking}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {blocking ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận chặn'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-500" />
                                Xóa cuộc trò chuyện
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                                Bạn có chắc chắn muốn xóa cuộc trò chuyện với <strong>{recipientName}</strong>?
                            </p>
                            <p className="text-sm text-gray-500">
                                Hành động này chỉ xóa cuộc trò chuyện ở phía bạn. Toàn bộ tin nhắn sẽ không còn hiển thị.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleDeleteConversation}
                                disabled={deleting}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        Đang xóa...
                                    </>
                                ) : (
                                    'Xác nhận xóa'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
