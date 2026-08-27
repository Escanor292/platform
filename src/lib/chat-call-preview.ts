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

export type CallEndReason = 'completed' | 'rejected' | 'missed' | 'cancelled';

export interface ParsedCallSignal {
  type: CallSignalType;
  mode?: 'voice' | 'video';
  from?: string;
  ts?: number;
  duration?: number;
  reason?: CallEndReason;
}

export interface CallEventView {
  title: string;
  subtitle: string;
  outcome: CallEndReason;
  mode: 'voice' | 'video';
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

/** MM:SS like Messenger (01:30). */
export function formatClockDuration(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatCallDuration(seconds?: number | null): string {
  return formatClockDuration(seconds);
}

function callTitle(mode?: string): string {
  return mode === 'video' ? 'Cuộc gọi video' : 'Cuộc gọi thoại';
}

export function resolveCallOutcome(sig: ParsedCallSignal): CallEndReason {
  if (sig.type === 'reject') return 'rejected';
  if (sig.reason === 'rejected' || sig.reason === 'missed' || sig.reason === 'cancelled' || sig.reason === 'completed') {
    return sig.reason;
  }
  if (typeof sig.duration === 'number' && sig.duration > 0) return 'completed';
  return 'cancelled';
}

export function getCallEventView(text: string): CallEventView | null {
  const sig = parseCallSignal(text);
  if (!sig) return null;
  if (sig.type !== 'end' && sig.type !== 'bye' && sig.type !== 'reject') return null;

  const outcome = resolveCallOutcome(sig);
  const mode = sig.mode === 'video' ? 'video' : 'voice';
  const title = callTitle(mode);
  let subtitle = 'Đã hủy';
  if (outcome === 'rejected') subtitle = 'Đã từ chối';
  else if (outcome === 'missed') subtitle = 'Không trả lời';
  else if (outcome === 'completed') {
    subtitle = formatClockDuration(sig.duration) || '00:00';
  } else {
    subtitle = 'Đã hủy';
  }
  return { title, subtitle, outcome, mode };
}

/** User-facing call events shown inside the thread (not SDP/ICE noise). */
export function isVisibleCallEvent(text: string, type?: string): boolean {
  if (type && type !== 'call-signal' && !parseCallSignal(text)) return false;
  const sig = parseCallSignal(text);
  if (!sig) return false;
  return sig.type === 'end' || sig.type === 'bye' || sig.type === 'reject';
}

export function describeCallSignal(text: string, messageType?: string): string {
  const view = getCallEventView(text);
  if (view) return `${view.title} · ${view.subtitle}`;

  const sig = parseCallSignal(text);
  if (!sig) {
    if (messageType === 'call-signal') return 'Tín hiệu cuộc gọi';
    return text;
  }
  if (sig.type === 'call') return sig.mode === 'video' ? 'Cuộc gọi video đến...' : 'Cuộc gọi thoại đến...';
  if (sig.type === 'accept') return 'Cuộc gọi được chấp nhận';
  if (sig.type === 'offer' || sig.type === 'answer' || sig.type === 'candidate') {
    return 'Đang kết nối cuộc gọi...';
  }
  return 'Tín hiệu cuộc gọi';
}

export function previewConversationLastMessage(text?: string, type?: string): string {
  if (!text) return '';
  if (type === 'call-signal' || parseCallSignal(text)) {
    return describeCallSignal(text, type);
  }
  return text;
}
