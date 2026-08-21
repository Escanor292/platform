export const ASSISTANT_TELEMETRY_EVENTS = ["opened", "answer_rendered", "answer_failed", "sensitive_rejected", "memory_cleared"] as const;

export type AssistantTelemetryEventType = (typeof ASSISTANT_TELEMETRY_EVENTS)[number];

export type AssistantTelemetryPayload = {
  event: AssistantTelemetryEventType;
  contextTraceCount?: number;
  hasAction?: boolean;
};

export function parseAssistantTelemetryPayload(value: unknown): AssistantTelemetryPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (typeof payload.event !== "string" || !ASSISTANT_TELEMETRY_EVENTS.includes(payload.event as AssistantTelemetryEventType)) return null;
  const contextTraceCount = typeof payload.contextTraceCount === "number" && Number.isInteger(payload.contextTraceCount) && payload.contextTraceCount >= 0 && payload.contextTraceCount <= 24 ? payload.contextTraceCount : undefined;
  const hasAction = typeof payload.hasAction === "boolean" ? payload.hasAction : undefined;
  return { event: payload.event as AssistantTelemetryEventType, ...(contextTraceCount === undefined ? {} : { contextTraceCount }), ...(hasAction === undefined ? {} : { hasAction }) };
}
