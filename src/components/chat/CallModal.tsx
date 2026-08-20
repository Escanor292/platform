/**
 * CallModal — giao diện cuộc gọi thoại/video WebRTC peer-to-peer (miễn phí)
 *
 * Hiển thị 3 trạng thái:
 * - incoming: cuộc gọi đến (chuông + chấp nhận/từ chối)
 * - ringing: đang gọi chờ bắt máy (hủy)
 * - active/connecting: video 2 bên + điều khiển mic/camera/kết thúc
 */
import { useEffect, useState } from 'react';
import {
    Phone,
    PhoneOff,
    PhoneIncoming,
    Video,
    VideoOff,
    Mic,
    MicOff,
    Loader2,
    FlipHorizontal,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { CallMode, CallPhase } from '@/hooks/useCall';

function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((w) => w.charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

interface CallModalProps {
    phase: CallPhase;
    mode: CallMode;
    isRemoteVideo: boolean;
    muted: boolean;
    cameraOff: boolean;
    callDuration: number;
    recipientName: string;
    recipientAvatar?: string;
    currentUserName: string;
    currentAvatar?: string;
    error: string | null;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
    onAccept: () => void;
    onReject: () => void;
    onEnd: () => void;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onDismissError: () => void;
    visible: boolean;
    onClose: () => void;
}

export function CallModal({
    phase,
    mode,
    isRemoteVideo,
    muted,
    cameraOff,
    callDuration,
    recipientName,
    recipientAvatar,
    currentUserName,
    currentAvatar,
    error,
    localVideoRef,
    remoteVideoRef,
    onAccept,
    onReject,
    onEnd,
    onToggleMute,
    onToggleCamera,
    onDismissError,
    visible,
    onClose,
}: CallModalProps) {
    const [mirrored, setMirrored] = useState(false);

    // Tự đóng modal thông báo lỗi/kết thúc sau một thời gian
    useEffect(() => {
        if (!visible || phase !== 'idle') return;
        const t = setTimeout(() => onClose(), 4000);
        return () => clearTimeout(t);
    }, [visible, phase, onClose]);

    if (!visible && phase === 'idle' && !error) return null;

    const isConnectingOrActive = phase === 'connecting' || phase === 'active';
    const activeVideo = isConnectingOrActive && mode === 'video';

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200",
            visible || phase !== 'idle' ? "opacity-100" : "pointer-events-none opacity-0"
        )}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={phase === 'idle' ? onClose : undefined} />
            <div className={cn(
                "relative w-full max-w-lg mx-4 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200",
                activeVideo ? "max-w-5xl bg-black rounded-2xl" : "bg-white rounded-3xl"
            )}>
                {activeVideo ? (
                    // ───────────── Giao diện video ─────────────
                    <div className="relative w-full aspect-video bg-gray-900">
                        {/* Video người nhận (to) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className={cn(
                                "w-full h-full object-cover",
                                !isRemoteVideo && "hidden"
                            )}
                        />
                        {/* Video của mình (nhỏ, góc phải) */}
                        <div className={cn(
                            "absolute bottom-3 right-3 w-36 aspect-video rounded-xl overflow-hidden border-2 border-white/80 shadow-lg bg-gray-800",
                            cameraOff && isRemoteVideo ? "" : ""
                        )}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={cn(
                                    "w-full h-full object-cover",
                                    mirrored && "scale-x-[-1]",
                                    cameraOff && "hidden"
                                )}
                            />
                            {(cameraOff || !isRemoteVideo) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 gap-2">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={currentAvatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                            {getInitials(currentUserName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-white/80 text-xs">{currentUserName}</span>
                                    {cameraOff && <VideoOff className="h-4 w-4 text-white/60" />}
                                </div>
                            )}
                            <button
                                onClick={() => setMirrored(!mirrored)}
                                className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition"
                                title="Xoay camera"
                            >
                                <FlipHorizontal className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        {/* Không có video từ xa */}
                        {!isRemoteVideo && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <Avatar className="h-20 w-20 ring-4 ring-white/20">
                                    <AvatarImage src={recipientAvatar} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                                        {getInitials(recipientName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-center">
                                    <p className="text-white font-semibold">{recipientName}</p>
                                    <p className="text-white/70 text-sm mt-1">
                                        {phase === 'connecting' ? (
                                            <span className="flex items-center gap-1.5 justify-center">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang kết nối...
                                            </span>
                                        ) : (
                                            formatDuration(callDuration)
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Header cuộc gọi video */}
                        <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
                            <div className="text-white">
                                <p className="font-semibold text-sm">{recipientName}</p>
                                <p className="text-white/80 text-xs">{mode === 'video' ? 'Gọi video' : 'Gọi thoại'}</p>
                            </div>
                            <p className="text-white/90 text-sm font-mono">{formatDuration(callDuration)}</p>
                        </div>
                        {/* Thanh điều khiển */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                            <button
                                onClick={onToggleMute}
                                className={cn(
                                    "p-3.5 rounded-full transition shadow-lg",
                                    muted ? "bg-white text-red-600" : "bg-white/90 text-gray-800 hover:bg-white"
                                )}
                                title={muted ? 'Bật micro' : 'Tắt micro'}
                            >
                                {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            </button>
                            <button
                                onClick={onEnd}
                                className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-lg"
                                title="Kết thúc cuộc gọi"
                            >
                                <PhoneOff className="h-5 w-5" />
                            </button>
                            <button
                                onClick={onToggleCamera}
                                className={cn(
                                    "p-3.5 rounded-full transition shadow-lg",
                                    cameraOff ? "bg-white text-red-600" : "bg-white/90 text-gray-800 hover:bg-white"
                                )}
                                title={cameraOff ? 'Bật camera' : 'Tắt camera'}
                            >
                                {cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                ) : (
                    // ───────────── Giao diện chờ (ringing / incoming) hoặc thoại không video ─────────────
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                                <AvatarImage src={recipientAvatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                                    {getInitials(recipientName)}
                                </AvatarFallback>
                            </Avatar>
                            {(phase === 'incoming' || phase === 'ringing') && (
                                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-white animate-pulse" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{recipientName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {phase === 'incoming'
                                ? `Cuộc gọi ${mode === 'video' ? 'video' : 'thoại'} đến...`
                                : phase === 'ringing'
                                    ? `Đang gọi ${mode === 'video' ? 'video' : 'thoại'}...`
                                    : phase === 'connecting'
                                        ? 'Đang kết nối...'
                                        : phase === 'active'
                                            ? `${mode === 'video' ? 'Gọi video' : 'Gọi thoại'} • ${formatDuration(callDuration)}`
                                            : ''}
                        </p>
                        {phase === 'connecting' && (
                            <Loader2 className="h-5 w-5 animate-spin text-primary mt-3" />
                        )}

                        {/* Điều khiển cho cuộc gọi thoại đang diễn ra */}
                        {phase === 'active' && mode === 'voice' && (
                            <div className="flex items-center gap-3 mt-6">
                                <button
                                    onClick={onToggleMute}
                                    className={cn(
                                        "p-3.5 rounded-full transition shadow",
                                        muted ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    )}
                                    title={muted ? 'Bật micro' : 'Tắt micro'}
                                >
                                    {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </button>
                                <button
                                    onClick={onEnd}
                                    className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow"
                                    title="Kết thúc cuộc gọi"
                                >
                                    <PhoneOff className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={onToggleCamera}
                                    className="p-3.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition shadow"
                                    title="Bật camera"
                                >
                                    <Video className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Nút chấp nhận / từ chối khi có cuộc gọi đến */}
                        {phase === 'incoming' && (
                            <div className="flex items-center gap-8 mt-8">
                                <button
                                    onClick={onReject}
                                    className="flex flex-col items-center gap-1.5"
                                    title="Từ chối"
                                >
                                    <span className="p-4 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition">
                                        <PhoneOff className="h-6 w-6" />
                                    </span>
                                    <span className="text-xs text-gray-500">Từ chối</span>
                                </button>
                                <button
                                    onClick={onAccept}
                                    className="flex flex-col items-center gap-1.5"
                                    title="Chấp nhận"
                                >
                                    <span className="p-4 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition animate-pulse">
                                        <PhoneIncoming className="h-6 w-6" />
                                    </span>
                                    <span className="text-xs text-gray-500">Chấp nhận</span>
                                </button>
                            </div>
                        )}

                        {/* Nút hủy khi đang gọi */}
                        {phase === 'ringing' && (
                            <button
                                onClick={onEnd}
                                className="mt-8 flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow"
                            >
                                <PhoneOff className="h-4 w-4" /> Hủy cuộc gọi
                            </button>
                        )}

                        {/* Thông báo lỗi */}
                        {error && (
                            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                {error}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
