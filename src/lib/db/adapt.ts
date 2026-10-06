const JSON_FIELDS = new Set([
  "tags", "images", "productImages", "mediaUrls", "imageUrls", "participantIds",
  "blockedBy", "hiddenBy", "readBy", "revealedBy", "userIds", "oldValue", "newValue",
  "changes", "attachments", "stats", "metadata", "ekycMeta", "payload", "data",
]);

function pack(value: unknown) {
  if (Array.isArray(value) || (value && typeof value === "object" && !(value instanceof Date))) {
    return JSON.stringify(value);
  }
  return value;
}

function unpack(value: unknown) {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text.startsWith("[") && !text.startsWith("{")) return value;
  try { return JSON.parse(text); } catch { return value; }
}

export function packWriteArgs(args: unknown): unknown {
  if (!args || typeof args !== "object") return args;
  if (Array.isArray(args)) return args.map(packWriteArgs);
  const source = args as Record<string, unknown>;
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "data" || key === "create" || key === "update") copy[key] = packWriteArgs(value);
    else if (JSON_FIELDS.has(key)) copy[key] = pack(value);
    else copy[key] = value;
  }
  return copy;
}

export function unpackRead(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(unpackRead);
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  const copy: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    copy[key] = JSON_FIELDS.has(key) ? unpack(item) : unpackRead(item);
  }
  return copy;
}
