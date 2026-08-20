import { prisma } from "@/lib/prisma";
import { BlacklistType } from "../../prisma/generated/client";

/**
 * Kiểm tra IP có bị blacklist không
 */
export async function isBlacklisted(
  type: BlacklistType,
  value: string
): Promise<{ blocked: boolean; reason?: string }> {
  const entry = await prisma.blacklist.findFirst({
    where: {
      type,
      value,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  if (entry) {
    return {
      blocked: true,
      reason: entry.reason,
    };
  }

  return { blocked: false };
}

/**
 * Thêm vào blacklist
 */
export async function addToBlacklist(
  type: BlacklistType,
  value: string,
  reason: string,
  addedBy?: string,
  expiresAt?: Date
) {
  return await prisma.blacklist.create({
    data: {
      id: crypto.randomUUID(),
      type,
      value,
      reason,
      addedBy,
      expiresAt,
      updatedAt: new Date(),
    },
  });
}

/**
 * Xóa khỏi blacklist
 */
export async function removeFromBlacklist(type: BlacklistType, value: string) {
  return await prisma.blacklist.updateMany({
    where: { type, value },
    data: { isActive: false },
  });
}

/**
 * Kiểm tra toàn bộ thông tin giao dịch
 */
export async function checkBlacklist(data: {
  ip?: string;
  email?: string;
  phone?: string;
  bankAccount?: string;
  deviceId?: string;
}): Promise<{ blocked: boolean; reason?: string; type?: string }> {
  const checks = [];

  if (data.ip) {
    checks.push(isBlacklisted("IP", data.ip));
  }
  if (data.email) {
    checks.push(isBlacklisted("EMAIL", data.email));
  }
  if (data.phone) {
    checks.push(isBlacklisted("PHONE", data.phone));
  }
  if (data.bankAccount) {
    checks.push(isBlacklisted("BANK_ACCOUNT", data.bankAccount));
  }
  if (data.deviceId) {
    checks.push(isBlacklisted("DEVICE_ID", data.deviceId));
  }

  const results = await Promise.all(checks);
  const blocked = results.find((r) => r.blocked);

  if (blocked) {
    return {
      blocked: true,
      reason: blocked.reason,
    };
  }

  return { blocked: false };
}
