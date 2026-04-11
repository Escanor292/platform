import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";

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
    const auditLog = await prisma.auditLog.create({
      data: {
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
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
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
