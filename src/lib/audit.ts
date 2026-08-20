import { prisma } from "@/lib/prisma";
import { AuditAction } from "../../prisma/generated/client";
import { auditLogMongoService } from "@/services/mongodb/audit-log.service";
import { activityLogService } from "@/services/mongodb/activity-log.service";
interface CreateAuditLogParams {
  userId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  changes?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  reason?: string | null;
  metadata?: any;
}

/**
 * Tạo audit log để tracking mọi thay đổi quan trọng
 */
export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    const auditLog = await prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        changes: params.changes || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        reason: params.reason || null,
        metadata: params.metadata || null,
      },
    });

    // Parallel logging to MongoDB (non-blocking)
    // 1. Audit Log (lưu trữ lâu dài, chi tiết nguyên bản như PG)
    auditLogMongoService.log({
      userId: params.userId || undefined,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      changes: params.changes,
      ipAddress: params.ipAddress || undefined,
      userAgent: params.userAgent || undefined,
      reason: params.reason || undefined,
      metadata: params.metadata,
      pgAuditLogId: auditLog.id,
    });

    // 2. Activity Log (cho frontend hiển thị timeline nếu cần)
    activityLogService.log({
      userId: params.userId || undefined,
      action: params.action as any,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.changes || params.newValue,
      metadata: {
        ...(params.metadata || {}),
        ipAddress: params.ipAddress || undefined,
        userAgent: params.userAgent || undefined,
      }
    });

    console.log(`[AUDIT] ${params.action} ${params.entityType}:${params.entityId} by ${params.userId || "SYSTEM"}`);

    return auditLog;
  } catch (error) {
    console.error("[AUDIT ERROR]", error);
    // Không throw error để không ảnh hưởng business logic
    return null;
  }
}

/**
 * Lấy audit logs của một entity
 */
export async function getAuditLogs(entityType: string, entityId: string) {
  return await prisma.audit_logs.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Tính toán changes giữa old và new value
 */
export function calculateChanges(oldValue: any, newValue: any): any {
  if (!oldValue || !newValue) return null;

  const changes: any = {};
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

  for (const key of allKeys) {
    if (oldValue[key] !== newValue[key]) {
      changes[key] = {
        from: oldValue[key],
        to: newValue[key],
      };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}
