import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PRESENTATION_DECK,
  PRESENTATION_MEDIA_FILES,
  PRESENTATION_SEED_VERSION,
} from "@/lib/admin-presentation-seed";
import { ACADEMIC_SLIDES } from "@/lib/admin-presentation-academic";
import type { PresentationDeck } from "@/lib/admin-presentation-types";

export type { PresentationDeck, PresentationSlide } from "@/lib/admin-presentation-types";

export const PRESENTATION_DECK_ID = "hybrid";

type DeckRow = {
  status: string;
  payload: PresentationDeck | null;
};

function withAcademicAppendix(deck: PresentationDeck): PresentationDeck {
  const slides = Array.isArray(deck.slides) ? deck.slides : [];
  const start = slides.findIndex(
    (slide) => slide.kicker === "Chương 1" || slide.title.includes("Phụ lục học thuật"),
  );
  const business = start >= 0 ? slides.slice(0, start) : slides;
  if (ACADEMIC_SLIDES.length === 0) return { ...deck, slides: business };
  return { ...deck, slides: [...business, ...ACADEMIC_SLIDES] };
}

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS presentation_deck (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'active',
      payload JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS presentation_media (
      key TEXT PRIMARY KEY,
      mime TEXT NOT NULL,
      bytes BYTEA NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function seedMediaFromPublic() {
  const dir = path.join(process.cwd(), "public", "presentations");
  for (const file of PRESENTATION_MEDIA_FILES) {
    try {
      const buf = await fs.readFile(path.join(dir, file));
      const hex = buf.toString("hex");
      const mime = file.endsWith(".png")
        ? "image/png"
        : file.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";
      await prisma.$executeRawUnsafe(
        `INSERT INTO presentation_media (key, mime, bytes, updated_at)
         VALUES ($1, $2, decode($3, 'hex'), NOW())
         ON CONFLICT (key) DO UPDATE
           SET mime = EXCLUDED.mime, bytes = EXCLUDED.bytes, updated_at = NOW()`,
        file,
        mime,
        hex,
      );
    } catch (error) {
      console.warn("[PRESENTATION MEDIA SEED]", file, error);
    }
  }
}

async function seedFreshIfMissing() {
  await prisma.$executeRawUnsafe(
    `INSERT INTO presentation_deck (id, status, payload, updated_at)
     VALUES ($1, 'active', $2::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE
       SET payload = EXCLUDED.payload, updated_at = NOW()
       WHERE presentation_deck.status = 'active'`,
    PRESENTATION_DECK_ID,
    JSON.stringify(DEFAULT_PRESENTATION_DECK),
  );
  const rows = await prisma.$queryRawUnsafe<Array<{ status: string }>>(
    `SELECT status FROM presentation_deck WHERE id = $1`,
    PRESENTATION_DECK_ID,
  );
  if (rows[0]?.status === "active") {
    await seedMediaFromPublic();
  }
}

async function readRow(): Promise<DeckRow | null> {
  await ensureTables();
  const rows = await prisma.$queryRawUnsafe<Array<{ status: string; payload: PresentationDeck | null }>>(
    `SELECT status, payload FROM presentation_deck WHERE id = $1`,
    PRESENTATION_DECK_ID,
  );
  return rows[0] ?? null;
}

export async function getActivePresentationDeck(): Promise<PresentationDeck | null> {
  try {
    let row = await readRow();
    if (!row) {
      await seedFreshIfMissing();
      row = await readRow();
    } else if (row.status === "active") {
      const storedVersion = row.payload?.version;
      if (storedVersion !== PRESENTATION_SEED_VERSION) {
        await prisma.$executeRawUnsafe(
          `UPDATE presentation_deck
           SET payload = $2::jsonb, updated_at = NOW()
           WHERE id = $1 AND status = 'active'`,
          PRESENTATION_DECK_ID,
          JSON.stringify(DEFAULT_PRESENTATION_DECK),
        );
        await seedMediaFromPublic();
        row = await readRow();
      }
    }
    if (!row || row.status !== "active" || !row.payload) return null;
    if (!Array.isArray(row.payload.slides) || row.payload.slides.length === 0) return null;
    return withAcademicAppendix(row.payload);
  } catch (error) {
    console.warn("[PRESENTATION READ]", error);
    return null;
  }
}

export async function isPresentationActive(): Promise<boolean> {
  return Boolean(await getActivePresentationDeck());
}

export async function getPresentationMedia(key: string) {
  if (!/^[a-z0-9._-]+$/i.test(key)) return null;
  await ensureTables();
  const rows = await prisma.$queryRawUnsafe<Array<{ mime: string; b64: string }>>(
    `SELECT mime, encode(bytes, 'base64') AS b64
     FROM presentation_media
     WHERE key = $1
     LIMIT 1`,
    key,
  );
  const row = rows[0];
  if (!row?.b64) return null;
  return { mime: row.mime || "image/jpeg", bytes: Buffer.from(row.b64, "base64") };
}

export async function deletePresentationDeck() {
  await ensureTables();
  await prisma.$executeRawUnsafe(
    `INSERT INTO presentation_deck (id, status, payload, updated_at)
     VALUES ($1, 'deleted', NULL, NOW())
     ON CONFLICT (id) DO UPDATE
       SET status = 'deleted', payload = NULL, updated_at = NOW()`,
    PRESENTATION_DECK_ID,
  );
  await prisma.$executeRawUnsafe(`DELETE FROM presentation_media`);
}
