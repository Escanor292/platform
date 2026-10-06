import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { refundLateCarrierHandoffs } from "@/lib/ship-sla";

/** CRON: hoàn đơn hàng nếu quá hạn gửi + 2 ngày chưa đưa vận chuyển. */
export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;
  try {
    const result = await refundLateCarrierHandoffs();
    return NextResponse.json({
      success: true,
      ...result,
      message: `Đã hoàn ${result.refundedCount} đơn trễ giao vận chuyển.`,
    });
  } catch (error: any) {
    console.error("Cron Error (ship-sla):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
