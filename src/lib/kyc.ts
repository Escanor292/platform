import { prisma } from "@/lib/prisma";
import { KYCStatus } from "@prisma/client";

/**
 * Kiểm tra user đã KYC chưa
 */
export async function isKYCVerified(userId: string): Promise<boolean> {
  const kyc = await prisma.kYCInfo.findUnique({
    where: { userId },
  });

  return kyc?.verificationStatus === "VERIFIED";
}

/**
 * Lấy thông tin KYC của user
 */
export async function getKYCInfo(userId: string) {
  return await prisma.kYCInfo.findUnique({
    where: { userId },
  });
}

/**
 * Lấy giới hạn giao dịch dựa trên KYC status
 */
export async function getTransactionLimit(userId: string) {
  const kyc = await getKYCInfo(userId);
  const kycStatus = kyc?.verificationStatus || "PENDING";

  // Tìm limit cụ thể cho user
  let limit = await prisma.transactionLimit.findUnique({
    where: { userId },
  });

  // Nếu không có, tìm limit mặc định cho KYC status
  if (!limit) {
    limit = await prisma.transactionLimit.findFirst({
      where: {
        userId: null,
        kycStatus: kycStatus as KYCStatus,
        isActive: true,
      },
    });
  }

  // Nếu vẫn không có, return limit mặc định
  if (!limit) {
    return getDefaultLimit(kycStatus as KYCStatus);
  }

  return limit;
}

/**
 * Giới hạn mặc định theo KYC status
 */
function getDefaultLimit(kycStatus: KYCStatus) {
  switch (kycStatus) {
    case "VERIFIED":
      return {
        maxPerTransaction: 500000000, // 500 triệu
        maxPerDay: 1000000000, // 1 tỷ
        maxPerMonth: 5000000000, // 5 tỷ
        maxTransactionsPerDay: 20,
      };
    case "PENDING":
    case "REJECTED":
    case "EXPIRED":
    default:
      return {
        maxPerTransaction: 20000000, // 20 triệu (theo luật VN)
        maxPerDay: 50000000, // 50 triệu
        maxPerMonth: 200000000, // 200 triệu
        maxTransactionsPerDay: 5,
      };
  }
}

/**
 * Kiểm tra giao dịch có vượt giới hạn không
 */
export async function checkTransactionLimit(
  userId: string | null,
  amount: number
): Promise<{ allowed: boolean; reason?: string; limit?: any }> {
  // Guest user (không đăng nhập)
  if (!userId) {
    const guestLimit = 20000000; // 20 triệu
    if (amount > guestLimit) {
      return {
        allowed: false,
        reason: `Giao dịch vượt quá giới hạn ${guestLimit.toLocaleString("vi-VN")} VNĐ cho khách. Vui lòng đăng nhập và xác minh danh tính.`,
      };
    }
    return { allowed: true };
  }

  // Lấy giới hạn
  const limit = await getTransactionLimit(userId);

  // Kiểm tra giới hạn mỗi giao dịch
  if (amount > Number(limit.maxPerTransaction)) {
    return {
      allowed: false,
      reason: `Giao dịch vượt quá giới hạn ${Number(limit.maxPerTransaction).toLocaleString("vi-VN")} VNĐ. Vui lòng xác minh danh tính để tăng hạn mức.`,
      limit,
    };
  }

  // Kiểm tra tổng giao dịch trong ngày
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayPledges = await prisma.pledge.findMany({
    where: {
      userId,
      status: "SUCCESS",
      createdAt: {
        gte: today,
      },
    },
  });

  const todayTotal = todayPledges.reduce((sum, p) => sum + Number(p.totalAmount), 0);
  
  if (todayTotal + amount > Number(limit.maxPerDay)) {
    return {
      allowed: false,
      reason: `Tổng giao dịch trong ngày vượt quá ${Number(limit.maxPerDay).toLocaleString("vi-VN")} VNĐ.`,
      limit,
    };
  }

  // Kiểm tra số lần giao dịch trong ngày
  if (todayPledges.length >= limit.maxTransactionsPerDay) {
    return {
      allowed: false,
      reason: `Đã đạt giới hạn ${limit.maxTransactionsPerDay} giao dịch trong ngày.`,
      limit,
    };
  }

  return { allowed: true, limit };
}

/**
 * Validate số CMND/CCCD
 */
export function validateIDCard(idCard: string, type: "CMND" | "CCCD" | "PASSPORT"): boolean {
  if (type === "CMND") {
    // CMND: 9 hoặc 12 số
    return /^\d{9}$|^\d{12}$/.test(idCard);
  } else if (type === "CCCD") {
    // CCCD: 12 số
    return /^\d{12}$/.test(idCard);
  } else if (type === "PASSPORT") {
    // Passport: 8-9 ký tự chữ và số
    return /^[A-Z0-9]{8,9}$/.test(idCard);
  }
  return false;
}
