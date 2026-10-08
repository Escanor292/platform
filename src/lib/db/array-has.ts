import { prisma } from "@/lib/prisma";
import { getDatabaseTarget } from "@/lib/db/target";
import { queryRaw } from "@/lib/sql/raw";

export async function idsMatchingArray(table: "conversations" | "campaign_updates", column: string, value: string, extraSql = "") {
  const rows = await queryRaw<Array<{ id: string }>>(
    `SELECT id FROM ${table} WHERE "${column}" @> ARRAY[$1]::text[] ${extraSql}`,
    value,
  );
  return rows.map((row) => row.id);
}

export async function conversationForUser(conversationId: string, userId: string) {
  if (getDatabaseTarget() !== "sqlserver") {
    return prisma.conversations.findFirst({
      where: { id: conversationId, participantIds: { has: userId } },
    });
  }
  const rows = await queryRaw<Array<{ id: string }>>(
    `SELECT id FROM conversations WHERE id = $1 AND "participantIds" @> ARRAY[$2]::text[]`,
    conversationId,
    userId,
  );
  if (!rows[0]) return null;
  return prisma.conversations.findUnique({ where: { id: conversationId } });
}
