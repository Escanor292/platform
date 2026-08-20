/**
 * useCall — quản lý cuộc gọi thoại/video WebRTC peer-to-peer (miễn phí, không cần server media)
 *
 * Signaling qua chính hệ thống tin nhắn MongoDB: gửi tin loại đặc biệt
 * type='call-signal' trong conversation, payload JSON trong field `signal`.
 * Media đi trực tiếp giữa 2 trình duyệt (P2P) qua STUN công cộng miễn phí.
 * Không tốn phí vận hành.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export type CallMode = 'voice' | 'video';
export type CallPhase =
    | 'idle'            // chưa có cuộc gọi
    | 'ringing'         // người gọi đang đổ chuông chờ
    | 'incoming'        // đang có cuộc gọi đến (người nhận thấy chuông)
    | 'connecting'      // đã chấp nhận, đang kết nối P2P
    | 'active'          // cuộc gọi đang diễn ra
    | 'ended';          // vừa kết thúc

export interface CallSignal {
    type: 'call' | 'accept' | 'reject' | 'offer' | 'answer' | 'candidate' | 'end' | 'bye';
    mode?: CallMode;
    from?: string;
    ts?: number;
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

const CALL_SIGNAL = 'call-signal';
const POLL_MS = 1200;
const CALL_TIMEOUT_MS = 45000;

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

function parseSignal(text: string): CallSignal | null {
    try {
        const obj = JSON.parse(text);
        if (obj && obj.type && (obj.ts || obj.type === 'end' || obj.type === 'bye')) return obj as CallSignal;
        return null;
    } catch {
        return null;
    }
}

export function useCall({
    conversationId,
    currentUserId,
    currentUserName,
    currentAvatar,
    recipientUserId,
    recipientName,
    recipientAvatar,
    onFetchMessages, // hàm gọi API để lấy tin nhắn mới nhất của conversation (bao gồm tín hiệu gọi)
}: {
    conversationId: string;
    currentUserId: string;
    currentUserName: string;
    currentAvatar?: string;
    recipientUserId?: string;
    recipientName: string;
    recipientAvatar?: string;
    onFetchMessages: () => Promise<any[]>;
}) {
    const [phase, setPhase] = useState<CallPhase>('idle');
    const [mode, setMode] = useState<CallMode>('voice');
    const [isRemoteVideo, setIsRemoteVideo] = useState(false);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const phaseRef = useRef<CallPhase>('idle');
    const callStartRef = useRef<number>(0);
    const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const processedTsRef = useRef<Set<string>>(new Set());
    const phaseConfigRef = useRef({ conversationId, currentUserId });
    phaseConfigRef.current = { conversationId, currentUserId };

    // Cập nhật phaseRef ngoài render phase (React Compiler forbids ref access during render)
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    // Dừng chuông/báo hiệu bằng Web Audio
    const stopRingTone = useCallback(() => {
        if (ringIntervalRef.current) {
            clearInterval(ringIntervalRef.current);
            ringIntervalRef.current = null;
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch {}
            audioCtxRef.current = null;
        }
    }, []);

    const playRingTone = useCallback(() => {
        stopRingTone();
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = ctx;
            const play = () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = 440;
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
                osc.connect(gain).connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.8);
            };
            play();
            ringIntervalRef.current = setInterval(play, 1500);
        } catch (err) {
            console.warn('Ring tone error', err);
        }
    }, [stopRingTone]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const msgs = await onFetchMessages();
                // Lọc tín hiệu gọi của đối phương (không phải mình)
                const signals = (msgs || [])
                    .filter((m: any) => m.type === CALL_SIGNAL && m.senderId !== currentUserId && !m.senderDeleted)
                    .map((m: any) => {
                        try { return JSON.parse(m.text); } catch { return null; }
                    })
                    .filter((s: any): s is CallSignal => !!s?.type);
                for (const sig of signals) {
                    const key = String(sig.ts ?? 0) + sig.type;
                    if (processedTsRef.current.has(key)) continue;
                    processedTsRef.current.add(key);
                    if (phaseRef.current === 'ringing' && sig.type === 'accept' && sig.mode) {
                        await handleAccept(sig.mode as CallMode);
                    } else if (phaseRef.current === 'ringing' && sig.type === 'reject') {
                        endCall(false);
                        setError('Đối phương đã từ chối cuộc gọi');
                        setTimeout(() => setPhase('idle'), 2500);
                    } else if (phaseRef.current === 'incoming' && sig.type === 'end') {
                        stopRingTone();
                        stopPolling();
                        setPhase('idle');
                        setError('Đối phương đã kết thúc cuộc gọi');
                        setTimeout(() => setError(null), 3000);
                    } else if (phaseRef.current === 'connecting' && sig.type === 'offer' && sig.sdp) {
                        await handleOffer(sig.sdp);
                    } else if (phaseRef.current === 'connecting' && sig.type === 'candidate' && sig.candidate) {
                        await handleCandidate(sig.candidate);
                    } else if (phaseRef.current === 'connecting' && sig.type === 'answer' && sig.sdp) {
                        await handleAnswer(sig.sdp);
                    } else if (phaseRef.current === 'active' && (sig.type === 'end' || sig.type === 'bye')) {
                        endCall(false);
                        setPhase('idle');
                    } else if (phaseRef.current === 'idle' && sig.type === 'call' && sig.mode) {
                        // Cuộc gọi đến mới
                        if (processedTsRef.current.has(String(sig.ts!))) continue;
                        stopPolling();
                        setMode(sig.mode as CallMode);
                        playRingTone();
                        setPhase('incoming');
                        // Tự động từ chối sau CALL_TIMEOUT_MS
                        setTimeout(() => {
                            if (phaseRef.current === 'incoming') {
                                stopRingTone();
                                rejectIncoming();
                                setPhase('idle');
                            }
                        }, CALL_TIMEOUT_MS);
                    } else if (phaseRef.current === 'ringing' && sig.type === 'end') {
                        endCall(false);
                        setPhase('idle');
                        setError('Đối phương đã hủy cuộc gọi');
                        setTimeout(() => setError(null), 3000);
                    }
                }
            } catch (err) {
                console.error('Call polling error', err);
            }
        }, POLL_MS);
    }, [currentUserId, onFetchMessages, stopRingTone, stopPolling]);

    // ───────────────────── Media ─────────────────────
    const getLocalStream = useCallback(async (m: CallMode): Promise<MediaStream> => {
        if (localStreamRef.current) return localStreamRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: m === 'video' ? { width: 640, height: 480 } : false,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        return stream;
    }, []);

    const createPeer = useCallback((mode: CallMode): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerRef.current = pc;

        // ICE candidate → gửi qua signaling
        pc.onicecandidate = async (ev) => {
            if (ev.candidate) {
                await sendSignal({ type: 'candidate', candidate: ev.candidate.toJSON(), ts: Date.now() });
            }
        };
        // Stream từ xa
        pc.ontrack = (ev) => {
            remoteStreamRef.current = ev.streams[0];
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
            setIsRemoteVideo(mode === 'video' && !!ev.streams[0].getVideoTracks().length);
        };
        // Stream của mình
        localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
        return pc;
    }, []);

    // ───────────────────── Signaling send ─────────────────────
    const sendSignal = useCallback(async (sig: Omit<CallSignal, 'from'>) => {
        const { conversationId: cid, currentUserId: uid } = phaseConfigRef.current;
        const payload = { ...sig, from: uid, ts: sig.ts ?? Date.now() };
        await fetch(`/api/chat/conversations/${cid}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: JSON.stringify(payload), type: CALL_SIGNAL }),
        }).catch((err) => console.error('Send signal error', err));
    }, []);

    // ───────────────────── Cuộc gọi đi ─────────────────────
    const startCall = useCallback(async (m: CallMode) => {
        try {
            setError(null);
            setMode(m);
            setPhase('ringing');
            callStartRef.current = Date.now();
            startPolling();
            // Gửi tín hiệu gọi đến ngay để đối phương reo chuông trước khi lấy media
            await sendSignal({ type: 'call', mode: m, ts: Date.now() });
            let stream: MediaStream;
            try {
                stream = await getLocalStream(m);
            } catch {
                setError(m === 'video' ? 'Không thể truy cập camera/micro. Vui lòng cấp quyền.' : 'Không thể truy cập micro. Vui lòng cấp quyền.');
                setTimeout(() => { setError(null); endCall(true); }, 5000);
                return;
            }
            // Timeout nếu đối phương không bắt máy
            setTimeout(() => {
                if (phaseRef.current === 'ringing') {
                    endCall(false);
                    setPhase('idle');
                    setError('Không có ai bắt máy');
                    setTimeout(() => setError(null), 3000);
                }
            }, CALL_TIMEOUT_MS);
            // Offer WebRTC sẽ được tạo và gửi sau khi đối phương chấp nhận
            // (xem handleAccept). Tín hiệu 'call' ở trên đã báo chuông rồi.
        } catch (err: any) {
            console.error('Start call error', err);
            setError('Không thể truy cập camera/micro. Vui lòng cấp quyền.');
            setTimeout(() => { setError(null); endCall(true); }, 5000);
        }
    }, [getLocalStream, sendSignal, startPolling]);

    // ───────────────────── Người nhận chấp nhận ─────────────────────
    const acceptIncoming = useCallback(async () => {
        try {
            stopRingTone();
            setPhase('connecting');
            const stream = await getLocalStream(mode);
            createPeer(mode);
            startPolling();
            await sendSignal({ type: 'accept', mode, ts: Date.now() });
            callStartRef.current = Date.now();
            startDurationTimer();
            // Chờ offer từ người gọi (do polling handleOffer)
        } catch (err: any) {
            console.error('Accept error', err);
            setError('Không thể truy cập camera/micro. Vui lòng cấp quyền.');
            setPhase('idle');
        }
    }, [mode, createPeer, getLocalStream, sendSignal, startPolling, stopRingTone]);

    const rejectIncoming = useCallback(async () => {
        stopRingTone();
        stopPolling();
        await sendSignal({ type: 'reject', ts: Date.now() }).catch(() => {});
        setPhase('idle');
    }, [sendSignal, stopPolling, stopRingTone]);

    // ───────────────────── Người gọi: xử lý accept ─────────────────────
    const handleAccept = useCallback(async (remoteMode: CallMode) => {
        try {
            const m: CallMode = mode; // chế độ người gọi khởi xướng
            createPeer(m);
            setPhase('connecting');
            const offer = await peerRef.current!.createOffer();
            await peerRef.current!.setLocalDescription(offer);
            await sendSignal({ type: 'offer', sdp: offer, ts: Date.now() });
        } catch (err) {
            console.error('Handle accept error', err);
        }
    }, [createPeer, mode, sendSignal]);

    // ───────────────────── Người nhận: xử lý offer ─────────────────────
    const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
        try {
            if (!peerRef.current) return;
            await peerRef.current.setRemoteDescription(sdp);
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            await sendSignal({ type: 'answer', sdp: answer, ts: Date.now() });
            // Cuộc gọi thực sự "active" khi remote stream bắt đầu; set an toàn:
            setTimeout(() => { if (phaseRef.current === 'connecting') setPhase('active'); }, 4000);
        } catch (err) {
            console.error('Handle offer error', err);
        }
    }, [sendSignal]);

    const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
        try {
            if (!peerRef.current) return;
            await peerRef.current.setRemoteDescription(sdp);
            setTimeout(() => { if (phaseRef.current === 'connecting') setPhase('active'); }, 4000);
        } catch (err) {
            console.error('Handle answer error', err);
        }
    }, []);

    const handleCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        try {
            await peerRef.current?.addIceCandidate(candidate);
        } catch (err) {
            console.error('Add candidate error', err);
        }
    }, []);

    // ───────────────────── Kết thúc / trong cuộc gọi ─────────────────────
    const startDurationTimer = () => {
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        setCallDuration(0);
        durationTimerRef.current = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
        }, 1000);
    };

    const toggleMute = useCallback(() => {
        localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
        setMuted((v) => !v);
    }, []);

    const toggleCamera = useCallback(async () => {
        const videoTracks = localStreamRef.current?.getVideoTracks() ?? [];
        if (videoTracks.length) {
            videoTracks.forEach((t) => (t.enabled = !t.enabled));
            setCameraOff((v) => !v);
            return;
        }
        // Đang gọi thoại → chuyển sang video
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            stream.getVideoTracks()[0].enabled = false; // tắt ngay, người dùng tự bật
            stream.getVideoTracks().forEach((t) => peerRef.current?.addTrack(t, stream));
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            setCameraOff(true);
            setIsRemoteVideo(true);
        } catch (err) {
            setError('Không thể bật camera');
        }
    }, []);

    const endCall = useCallback((notify: boolean) => {
        stopRingTone();
        stopPolling();
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        peerRef.current?.close();
        peerRef.current = null;
        // Gửi tín hiệu kết thúc cho đối phương TRƯỚC khi đặt phase idle
        // (để điều kiện check không bị fail và đối phương tắt chuông/đóng modal)
        if (notify && phaseRef.current !== 'idle') {
            sendSignal({ type: 'end', ts: Date.now() }).catch(() => {});
        }
        setPhase('idle');
        setMuted(false);
        setCameraOff(false);
        setIsRemoteVideo(false);
        setCallDuration(0);
    }, [sendSignal, stopPolling, stopRingTone]);

    // Cleanup khi unmount hoặc đổi conversation
    useEffect(() => {
        return () => {
            endCall(false);
        };
    }, [conversationId]);

    return {
        phase,
        mode,
        isRemoteVideo,
        muted,
        cameraOff,
        error,
        callDuration,
        localVideoRef,
        remoteVideoRef,
        setError,
        startCall,
        acceptIncoming,
        rejectIncoming,
        toggleMute,
        toggleCamera,
        endCall,
    };
}
