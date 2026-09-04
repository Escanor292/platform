import type { OcrFields } from "./types";

export type CccdQrParse = Partial<OcrFields> & {
  gender?: string;
  oldId?: string;
  raw: string;
};

const ID12 = /\d{12}/;
const ID9 = /^\d{9}$/;
const DATE8 = /^(\d{2})(\d{2})(\d{4})$/;

function compactDate(value: string) {
  return value.replace(/[./\-\s]/g, "");
}

function toIso(ddmmyyyy: string): string | null {
  const m = DATE8.exec(compactDate(ddmmyyyy));
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > 2100) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function titleCaseVi(name: string) {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function isSex(value: string) {
  return /^(nam|n[uữ]|nu|male|female|m|f)$/i.test(value.trim());
}

/**
 * QR CCCD chip (mặt sau) thường là chuỗi phân tách bằng | :
 * số CCCD | CMND cũ | họ tên | ngày sinh ddMMyyyy | giới tính | nơi thường trú | ngày cấp
 */
export function parseCccdQr(raw: string): CccdQrParse | null {
  const text = String(raw || "").replace(/^\uFEFF/, "").trim();
  if (!text) return null;

  const parts = text.split(/[|\t;]/).map((p) => p.trim());
  const idIndex = parts.findIndex((p) => ID12.test(p));
  if (idIndex < 0) return null;

  const idCardNumber = parts[idIndex].match(ID12)?.[0] || "";
  if (!idCardNumber) return null;

  const rest = parts.slice(idIndex + 1);
  let i = 0;
  let oldId: string | undefined;
  if (rest[0] !== undefined && (ID9.test(rest[0]) || rest[0] === "")) {
    oldId = ID9.test(rest[0]) ? rest[0] : undefined;
    i = 1;
  }

  const fullNameRaw = rest[i] || "";
  const dobRaw = rest[i + 1] || "";
  const sexRaw = rest[i + 2] || "";
  const tailStart = isSex(sexRaw) ? i + 3 : i + 2;
  const tail = rest.slice(tailStart);

  let idCardIssueDate: string | null = null;
  const addressParts: string[] = [];
  for (const item of tail) {
    if (!item) continue;
    if (isSex(item)) continue;
    const iso = toIso(item);
    if (iso) {
      idCardIssueDate = iso;
      continue;
    }
    addressParts.push(item);
  }

  const dateOfBirth = toIso(dobRaw);
  const fullName = fullNameRaw ? titleCaseVi(fullNameRaw) : "";
  const permanentAddress = addressParts.join(", ") || null;

  return {
    fullName,
    idCardNumber,
    idCardType: "CCCD",
    dateOfBirth,
    idCardIssueDate,
    permanentAddress,
    placeOfBirth: addressParts.length > 1 ? addressParts[0] : null,
    gender: isSex(sexRaw) ? sexRaw : undefined,
    oldId,
    raw: text,
  };
}
