/**
 * DEPRECATED — MongoDB audit log không còn dual-write.
 * Dùng Prisma audit_logs trực tiếp (src/lib/audit.ts).
 */
export const auditLogMongoService = {
  log: (_data: unknown): void => undefined,
  getEntityLogs: async (_entityType: string, _entityId: string, _limit?: number) =>
    [] as any[],
  getUserLogs: async (_userId: string, _limit?: number) => [] as any[],
  getLogsByAction: async (
    _action: string,
    _fromDate: Date,
    _toDate: Date,
    _limit?: number
  ) => [] as any[],
  aggregateByAction: async (_fromDate: Date, _toDate: Date) => [] as any[],
  getByPgId: async (_pgAuditLogId: string) => null,
  ensureIndexes: async (): Promise<void> => undefined,
};
