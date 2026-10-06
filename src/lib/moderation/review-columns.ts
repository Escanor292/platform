import { prisma } from '@/lib/prisma';
import { executeRaw, queryRaw } from "@/lib/sql/raw";

type Column = { name: string; sqlType: string };

export async function ensureTableColumns(table: string, columns: Column[]): Promise<void> {
  for (const column of columns) {
    try {
      await executeRaw(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column.name}" ${column.sqlType}`
      );
    } catch (error) {
      console.error(`[MODERATION] ensure ${table}.${column.name} failed:`, error);
    }
  }
}

export async function getExtraFields<T extends Record<string, unknown>>(
  table: string,
  ids: string[],
  columns: string[]
): Promise<Record<string, T>> {
  if (ids.length === 0) return {};
  const selectList = ['id', ...columns.map((name) => `"${name}"`)].join(', ');
  const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
  try {
    const rows = await queryRaw<Array<T & { id: string }>>(
      `SELECT ${selectList} FROM ${table} WHERE id IN (${placeholders})`,
      ...ids
    );
    return Object.fromEntries(rows.map((row) => [row.id, row]));
  } catch (error) {
    console.error(`[MODERATION] getExtraFields ${table} failed:`, error);
    return {};
  }
}
