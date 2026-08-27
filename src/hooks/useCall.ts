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
export type CallEndReason = 'completed' | 'rejected' | 'missed' | 'cancelled';
export type CallPhase =
    | 'idle'
    | 'ringing'
    | 'incoming'
    | 'connecting'
    | 'active'
    | 'ended';

export interface CallSignal {
    type: 'call' | 'accept' | 'reject' | 'offer' | 'answer' | 'candidate' | 'end' | 'bye';
    mode?: CallMode;
    from?: string;
    ts?: number;
    duration?: number;
    reason?: CallEndReason;
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

export function useCall({
    conversationId,
    currentUserId,
    currentUserName,
    currentAvatar,
    recipientUserId,
    recipientName,
    recipientAvatar,
    onFetchMessages,
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
    const connectedRef = useRef(false);
    const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const processedTsRef = useRef<Set<string>>(new Set());
    const modeRef = useRef<CallMode>('voice');
    const phaseConfigRef = useRef({ conversationId, currentUserId });
    phaseConfigRef.current = { conversationId, currentUserId };

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

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

    const sendSignal = useCallback(async (sig: Omit<CallSignal, 'from'>) => {
        const { conversationId: cid, currentUserId: uid } = phaseConfigRef.current;
        const payload = { ...sig, from: uid, ts: sig.ts ?? Date.now() };
        await fetch(`/api/chat/conversations/${cid}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: JSON.stringify(payload), type: CALL_SIGNAL }),
        }).catch((err) => console.error('Send signal error', err));
    }, []);

    const startPolling = useCallback(() => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const msgs = await onFetchMessages();
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
                        if (processedTsRef.current.has(String(sig.ts!))) continue;
                        stopPolling();
                        setMode(sig.mode as CallMode);
                        playRingTone();
                        setPhase('incoming');
                        setTimeout(() => {
                            if (phaseRef.current === 'incoming') {
                                missIncoming();
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

    const createPeer = useCallback((callMode: CallMode): RTCPeerConnection => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerRef.current = pc;

        pc.onicecandidate = async (ev) => {
            if (ev.candidate) {
                await sendSignal({ type: 'candidate', candidate: ev.candidate.toJSON(), ts: Date.now() });
            }
        };
        pc.ontrack = (ev) => {
            remoteStreamRef.current = ev.streams[0];
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = ev.streams[0];
            setIsRemoteVideo(callMode === 'video' && !!ev.streams[0].getVideoTracks().length);
        };
        localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
        return pc;
    }, [sendSignal]);

    const startDurationTimer = () => {
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        setCallDuration(0);
        durationTimerRef.current = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - callStartRef.current) / 1000));
        }, 1000);
    };

    const cleanupMedia = () => {
        stopRingTone();
        stopPolling();
        if (durationTimerRef.current) clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        peerRef.current?.close();
        peerRef.current = null;
    };

    const endCall = useCallback((notify: boolean, reason?: CallEndReason) => {
        const currentPhase = phaseRef.current;
        let resolved: CallEndReason = reason || 'cancelled';
        if (!reason) {
            if (connectedRef.current || currentPhase === 'active' || currentPhase === 'connecting') {
                resolved = 'completed';
            } else if (currentPhase === 'ringing') {
                resolved = 'cancelled';
            } else if (currentPhase === 'incoming') {
                resolved = 'rejected';
            }
        }
        const duration =
            resolved === 'completed' && callStartRef.current
                ? Math.max(0, Math.floor((Date.now() - callStartRef.current) / 1000))
                : 0;

        if (notify && currentPhase !== 'idle') {
            sendSignal({
                type: resolved === 'rejected' ? 'reject' : 'end',
                reason: resolved,
                duration,
                mode: modeRef.current,
                ts: Date.now(),
            }).catch(() => {});
        }

        cleanupMedia();
        connectedRef.current = false;
        setPhase('idle');
        setMuted(false);
        setCameraOff(false);
        setIsRemoteVideo(false);
        setCallDuration(0);
    }, [sendSignal, stopPolling, stopRingTone]);

    const startCall = useCallback(async (m: CallMode) => {
        try {
            setError(null);
            setMode(m);
            connectedRef.current = false;
            setPhase('ringing');
            callStartRef.current = Date.now();
            startPolling();
            await sendSignal({ type: 'call', mode: m, ts: Date.now() });
            try {
                await getLocalStream(m);
            } catch {
                setError(m === 'video' ? 'Không thể truy cập camera/micro. Vui lòng cấp quyền.' : 'Không thể truy cập micro. Vui lòng cấp quyền.');
                setTimeout(() => { setError(null); endCall(true, 'cancelled'); }, 5000);
                return;
            }
            setTimeout(() => {
                if (phaseRef.current === 'ringing') {
                    endCall(true, 'missed');
                    setError('Không có ai bắt máy');
                    setTimeout(() => setError(null), 3000);
                }
            }, CALL_TIMEOUT_MS);
        } catch (err: any) {
            console.error('Start call error', err);
            setError('Không thể truy cập camera/micro. Vui lòng cấp quyền.');
            setTimeout(() => { setError(null); endCall(true, 'cancelled'); }, 5000);
        }
    }, [getLocalStream, sendSignal, startPolling, endCall]);

    const acceptIncoming = useCallback(async () => {
        try {
            stopRingTone();
            setPhase('connecting');
            connectedRef.current = true;
            await getLocalStream(mode);
            createPeer(mode);
            startPolling();
            await sendSignal({ type: 'accept', mode, ts: Date.now() });
            callStartRef.current = Date.now();
            startDurationTimer();
        } catch (err: any) {
            console.error('Accept error', err);
            setError('Không thể truy cập camera/micro. Vui lòng cấp quyền.');
            setPhase('idle');
        }
    }, [mode, createPeer, getLocalStream, sendSignal, startPolling, stopRingTone]);

    const rejectIncoming = useCallback(async () => {
        stopRingTone();
        stopPolling();
        await sendSignal({
            type: 'reject',
            reason: 'rejected',
            mode: modeRef.current,
            ts: Date.now(),
        }).catch(() => {});
        connectedRef.current = false;
        setPhase('idle');
    }, [sendSignal, stopPolling, stopRingTone]);

    const missIncoming = useCallback(async () => {
        stopRingTone();
        stopPolling();
        await sendSignal({
            type: 'end',
            reason: 'missed',
            mode: modeRef.current,
            ts: Date.now(),
        }).catch(() => {});
        connectedRef.current = false;
        setPhase('idle');
    }, [sendSignal, stopPolling, stopRingTone]);

    const handleAccept = useCallback(async (_remoteMode: CallMode) => {
        try {
            const m: CallMode = modeRef.current;
            connectedRef.current = true;
            createPeer(m);
            setPhase('connecting');
            callStartRef.current = Date.now();
            startDurationTimer();
            const offer = await peerRef.current!.createOffer();
            await peerRef.current!.setLocalDescription(offer);
            await sendSignal({ type: 'offer', sdp: offer, ts: Date.now() });
        } catch (err) {
            console.error('Handle accept error', err);
        }
    }, [createPeer, sendSignal]);

    const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
        try {
            if (!peerRef.current) return;
            await peerRef.current.setRemoteDescription(sdp);
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            await sendSignal({ type: 'answer', sdp: answer, ts: Date.now() });
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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
            stream.getVideoTracks()[0].enabled = false;
            stream.getVideoTracks().forEach((t) => peerRef.current?.addTrack(t, stream));
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            setCameraOff(true);
            setIsRemoteVideo(true);
        } catch (err) {
            setError('Không thể bật camera');
        }
    }, []);

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
