import prisma from "@/lib/prisma";

/**
 * Tạo campaign code duy nhất với format: CF-YYYYMMDD-XXXXX
 * CF = CrowdFunding
 * YYYYMMDD = Ngày tạo
 * XXXXX = 5 ký tự ngẫu nhiên
 */
export async function generateUniqueCampaignCode(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const campaignCode = `CF-${dateStr}-${randomStr}`;
    
    // Kiểm tra xem code đã tồn tại chưa
    const existing = await prisma.campaigns.findUnique({
      where: { campaignCode }
    });
    
    if (!existing) {
      return campaignCode;
    }
    
    attempts++;
  }
  
  // Nếu sau 10 lần vẫn trùng, thêm timestamp để đảm bảo unique
  const timestamp = Date.now().toString().slice(-5);
  return `CF-${dateStr}-${timestamp}`;
}

/**
 * Format campaign code để hiển thị
 * VD: CF-20260416-ABC12 -> CF-20260416-ABC12
 */
export function formatCampaignCode(code: string): string {
  return code;
}

/**
 * Validate campaign code format
 */
export function isValidCampaignCode(code: string): boolean {
  // Format: CF-YYYYMMDD-XXXXX
  const pattern = /^CF-\d{8}-[A-Z0-9]{5}$/;
  return pattern.test(code);
}
