import { readFileSync } from "fs";
import path from "path";
import { postgresPrisma } from "@/lib/prisma";
import { getMssqlClient } from "@/lib/db/mssql-client";

const JSON_FIELDS = new Set([
  "tags", "images", "productImages", "mediaUrls", "imageUrls", "participantIds",
  "blockedBy", "hiddenBy", "readBy", "revealedBy", "userIds", "oldValue", "newValue",
  "changes", "attachments", "stats", "metadata", "ekycMeta", "payload", "data",
]);

function modelNames() {
  const schema = readFileSync(path.join(process.cwd(), "prisma", "schema.sqlserver.prisma"), "utf8");
  return [...schema.matchAll(/^model\s+(\w+)/gm)].map((match) => match[1]);
}

function packRow(row: Record<string, unknown>) {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === "object" && !(value instanceof Date) && !Array.isArray(value) && value.constructor?.name === "Decimal") {
      copy[key] = value.toString();
    } else if (JSON_FIELDS.has(key) && value != null && typeof value !== "string") {
      copy[key] = JSON.stringify(value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

export async function copyPostgresToMssql() {
  const mssql = getMssqlClient() as Record<string, any> | null;
  if (!mssql) throw new Error("Chưa có client MS SQL.");
  const names = modelNames();
  for (const name of names) {
    await mssql.$executeRawUnsafe(`ALTER TABLE [${name}] NOCHECK CONSTRAINT ALL`).catch(() => undefined);
  }
  let rows = 0;
  for (const name of names) {
    const delegate = (postgresPrisma as Record<string, any>)[name];
    const target = mssql[name];
    if (!delegate?.findMany || !target?.deleteMany || !target?.createMany) continue;
    const records = await delegate.findMany();
    await target.deleteMany();
    for (let index = 0; index < records.length; index += 40) {
      const data = records.slice(index, index + 40).map(packRow);
      if (data.length) await target.createMany({ data });
    }
    rows += records.length;
  }
  for (const name of names) {
    await mssql.$executeRawUnsafe(`ALTER TABLE [${name}] WITH CHECK CHECK CONSTRAINT ALL`).catch(() => undefined);
  }
  return { tables: names.length, rows };
}
