import { NextResponse } from "next/server";
import { closeExpiredCampaigns } from "@/lib/campaign-lifecycle";

/**
 * CRON API: Đóng chiến dịch hết hạn.
 * All-or-Nothing không đạt mục tiêu → FAILED + hoàn tiền.
 * Keep-It-All không đạt mục tiêu → SUCCESS, không hoàn, vẫn giữ phí sàn.
 */
export async function GET() {
  try {
    const result = await closeExpiredCampaigns();
    return NextResponse.json({
      success: true,
      ...result,
      message: `Đã đóng ${result.closedCount} chiến dịch hết hạn.`,
    });
  } catch (error: any) {
    console.error("Cron Error (update status):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
