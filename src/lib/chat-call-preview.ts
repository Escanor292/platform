/** Preview / system-event helpers for WebRTC call-signal messages. */

export type CallSignalType =
  | 'call'
  | 'accept'
  | 'reject'
  | 'offer'
  | 'answer'
  | 'candidate'
  | 'end'
  | 'bye';

export interface ParsedCallSignal {
  type: CallSignalType;
  mode?: 'voice' | 'video';
  from?: string;
  ts?: number;
  duration?: number;
}

export function parseCallSignal(text: string): ParsedCallSignal | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (!obj || typeof obj.type !== 'string') return null;
    return obj as ParsedCallSignal;
  } catch {
    return null;
  }
}

export function formatCallDuration(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '';
  const total = Math.floor(seconds);
  if (total < 1) return 'dưới 1 giây';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} giờ`);
  if (m > 0) parts.push(`${m} phút`);
  if (s > 0 || parts.length === 0) parts.push(`${s} giây`);
  return parts.join(' ');
}

/** User-facing call events shown inside the thread (not SDP/ICE noise). */
export function isVisibleCallEvent(text: string, type?: string): boolean {
  if (type && type !== 'call-signal' && !parseCallSignal(text)) return false;
  const sig = parseCallSignal(text);
  if (!sig) return false;
  return sig.type === 'end' || sig.type === 'bye' || sig.type === 'reject';
}

export function describeCallSignal(text: string, messageType?: string): string {
  const sig = parseCallSignal(text);
  if (!sig) {
    if (messageType === 'call-signal') return '📞 Tín hiệu cuộc gọi';
    return text;
  }

  const durationLabel = formatCallDuration(sig.duration);
  const video = sig.mode === 'video';

  if (sig.type === 'call') {
    return video ? '📹 Cuộc gọi video đến...' : '📞 Cuộc gọi thoại đến...';
  }
  if (sig.type === 'accept') {
    return video ? '📹 Cuộc gọi video được chấp nhận' : '📞 Cuộc gọi thoại được chấp nhận';
  }
  if (sig.type === 'end' || sig.type === 'bye') {
    return durationLabel
      ? `🙅 Cuộc gọi đã kết thúc · ${durationLabel}`
      : '🙅 Cuộc gọi đã kết thúc';
  }
  if (sig.type === 'reject') return '❌ Cuộc gọi bị từ chối';
  if (sig.type === 'offer' || sig.type === 'answer' || sig.type === 'candidate') {
    return video ? '📹 Đang kết nối cuộc gọi video...' : '📞 Đang kết nối cuộc gọi...';
  }
  return '📞 Tín hiệu cuộc gọi';
}

export function previewConversationLastMessage(text?: string, type?: string): string {
  if (!text) return '';
  if (type === 'call-signal' || parseCallSignal(text)) {
    return describeCallSignal(text, type);
  }
  return text;
}
