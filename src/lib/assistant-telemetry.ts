"use client";

import { type AssistantTelemetryPayload } from "@/lib/assistant-telemetry-contract";

const CONSENT_KEY = "tutefund-assistant-telemetry-consent-v1";

function storageAvailable() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getAssistantTelemetryConsent() {
  return storageAvailable() && localStorage.getItem(CONSENT_KEY) === "granted";
}

export function setAssistantTelemetryConsent(enabled: boolean) {
  if (storageAvailable()) localStorage.setItem(CONSENT_KEY, enabled ? "granted" : "denied");
}

export function recordAssistantTelemetry(payload: AssistantTelemetryPayload) {
  if (!getAssistantTelemetryConsent() || typeof fetch !== "function") return;
  void fetch("/api/public/assistant-telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
