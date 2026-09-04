"use client";

import { parseCccdQr, type CccdQrParse } from "./cccd-qr";

async function loadJsQR(): Promise<(data: Uint8ClampedArray, w: number, h: number, opts?: object) => { data: string } | null> {
  const w = window as any;
  if (typeof w.jsQR === "function") return w.jsQR;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector("script[data-jsqr]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("jsQR load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    script.dataset.jsqr = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("jsQR load failed"));
    document.head.appendChild(script);
  });
  if (typeof w.jsQR !== "function") throw new Error("jsQR unavailable");
  return w.jsQR;
}

async function sourceToBitmap(src: File | Blob | string): Promise<ImageBitmap> {
  if (src instanceof Blob) return createImageBitmap(src);
  const res = await fetch(src, { mode: "cors" });
  if (!res.ok) throw new Error("Không tải được ảnh để đọc QR");
  return createImageBitmap(await res.blob());
}

async function detectWithBarcodeDetector(bitmap: ImageBitmap): Promise<string | null> {
  const Detector = (window as any).BarcodeDetector;
  if (!Detector) return null;
  try {
    const detector = new Detector({ formats: ["qr_code"] });
    const codes = await detector.detect(bitmap);
    return codes?.[0]?.rawValue || null;
  } catch {
    return null;
  }
}

async function detectWithJsQR(bitmap: ImageBitmap): Promise<string | null> {
  const jsQR = await loadJsQR();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const scales = [1, 1.6, 2.2, 0.7];
  for (const scale of scales) {
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(image.data, image.width, image.height, { inversionAttempts: "attemptBoth" });
    if (result?.data) return result.data;
  }
  return null;
}

export async function decodeCccdQrFromImage(src: File | Blob | string): Promise<CccdQrParse | null> {
  const bitmap = await sourceToBitmap(src);
  const raw = (await detectWithBarcodeDetector(bitmap)) || (await detectWithJsQR(bitmap));
  if (!raw) return null;
  return parseCccdQr(raw);
}
