const HREF_SRC_RE = /(?:href|src)=["']([^"']+)["']/gi;
const JSON_HREF_RE = /"(?:href|src|url|imageUrl|coverImage|videoUrl|website)"\s*:\s*"([^"]+)"/gi;
const BARE_URL_RE = /https?:\/\/[^\s<>"'`)\]]+/gi;

const SKIP_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export function normalizeHttpUrl(raw: string): string | null {
  const trimmed = String(raw || "")
    .trim()
    .replace(/&/g, "&")
    .replace(/[.,;:!?)\\]+$/g, "");
  if (!trimmed || trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:") || trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (SKIP_HOSTS.has(url.hostname) || url.hostname.endsWith(".local")) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function extractHttpUrls(...chunks: Array<string | string[] | null | undefined>): string[] {
  const found = new Set<string>();
  const add = (value?: string | null) => {
    const url = normalizeHttpUrl(String(value || ""));
    if (url) found.add(url);
  };

  for (const chunk of chunks) {
    if (Array.isArray(chunk)) {
      chunk.forEach(add);
      continue;
    }
    const text = String(chunk || "");
    if (!text) continue;
    for (const match of text.matchAll(HREF_SRC_RE)) add(match[1]);
    for (const match of text.matchAll(JSON_HREF_RE)) add(match[1]);
    for (const match of text.matchAll(BARE_URL_RE)) add(match[0]);
  }
  return [...found];
}

export function isBrokenHttpStatus(status: number | null): boolean {
  if (status == null) return true;
  if (status === 429) return false;
  return status >= 400;
}

export async function probeHttpUrl(url: string, timeoutMs = 8000): Promise<{ ok: boolean; status: number | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = {
    "User-Agent": "TuTeFund-LinkCheck/1.0",
    Accept: "*/*",
  };
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal, headers });
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { ...headers, Range: "bytes=0-0" },
      });
    }
    return { ok: !isBrokenHttpStatus(res.status), status: res.status };
  } catch {
    return { ok: false, status: null };
  } finally {
    clearTimeout(timer);
  }
}
