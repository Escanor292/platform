"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { hashUgcText, needsTranslation } from "@/lib/ugc-translate-core";

type Props = {
  text?: string | null;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  title?: boolean;
};

const LS_PREFIX = "tute-ugc-en:";
type Waiter = (value: string) => void;
const queue = new Map<string, Waiter[]>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const inFlight = new Set<string>();

function readLocal(text: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(LS_PREFIX + hashUgcText(text));
  } catch {
    return null;
  }
}

function writeLocal(text: string, translated: string) {
  try {
    window.sessionStorage.setItem(LS_PREFIX + hashUgcText(text), translated);
  } catch {
    // quota / private mode
  }
}

function enqueue(text: string): Promise<string> {
  const local = readLocal(text);
  if (local) return Promise.resolve(local);
  return new Promise((resolve) => {
    const waiters = queue.get(text) || [];
    waiters.push(resolve);
    queue.set(text, waiters);
    if (!flushTimer) flushTimer = setTimeout(flushQueue, 50);
  });
}

async function flushQueue() {
  flushTimer = null;
  const batch = Array.from(queue.keys()).filter((text) => !inFlight.has(text)).slice(0, 20);
  if (batch.length === 0) return;
  batch.forEach((text) => inFlight.add(text));
  try {
    const response = await fetch("/api/public/translate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ texts: batch, target: "en" }),
    });
    const data = response.ok ? await response.json() : { translations: batch };
    const translations: string[] = Array.isArray(data?.translations) ? data.translations : batch;
    batch.forEach((text, index) => {
      const next = (translations[index] || text).trim() || text;
      writeLocal(text, next);
      (queue.get(text) || []).forEach((waiter) => waiter(next));
      queue.delete(text);
      inFlight.delete(text);
    });
  } catch {
    batch.forEach((text) => {
      (queue.get(text) || []).forEach((waiter) => waiter(text));
      queue.delete(text);
      inFlight.delete(text);
    });
  }
  if (queue.size > 0 && !flushTimer) flushTimer = setTimeout(flushQueue, 30);
}

export default function UgcText({ text, className, as: Tag = "span", title }: Props) {
  const { locale } = useI18n();
  const source = text || "";
  const [value, setValue] = useState(source);

  useEffect(() => {
    setValue(source);
    if (locale !== "en" || !needsTranslation(source)) return;
    const cached = readLocal(source);
    if (cached) {
      setValue(cached);
      return;
    }
    let cancelled = false;
    enqueue(source).then((next) => {
      if (!cancelled) setValue(next);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, source]);

  return (
    <Tag className={className} title={title ? value : undefined}>
      {value}
    </Tag>
  );
}
