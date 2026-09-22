import { createServerFn } from "@tanstack/react-start";
import type { SoState } from "./types";

const PATH = "/workspace/.data/tute-so-ledger.json";

export type LedgerSnap = { rev: number; state: SoState };

async function readSnap(): Promise<LedgerSnap | null> {
  const { readFile } = await import("node:fs/promises");
  try {
    return JSON.parse(await readFile(PATH, "utf8")) as LedgerSnap;
  } catch {
    return null;
  }
}

export const pullLedger = createServerFn({ method: "GET" }).handler(async (): Promise<LedgerSnap | null> => readSnap());

export const pushLedger = createServerFn({ method: "POST" })
  .inputValidator((input: { rev: number; state: SoState }) => input)
  .handler(async ({ data }): Promise<{ ok: true; rev: number } | { ok: false; current: LedgerSnap }> => {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const current = await readSnap();
    if (current && data.rev !== current.rev) return { ok: false, current };
    const next: LedgerSnap = { rev: (current?.rev ?? 0) + 1, state: data.state };
    await mkdir("/workspace/.data", { recursive: true });
    await writeFile(PATH, JSON.stringify(next));
    return { ok: true, rev: next.rev };
  });
