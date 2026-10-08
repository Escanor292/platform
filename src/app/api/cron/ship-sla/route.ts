import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { refundLateCarrierHandoffs } from "@/lib/ship-sla";
import { autoReleaseHeldRewards } from "@/lib/payment/release-reward";

/** CRON: hoàn đơn hàng nếu quá hạn gửi + 2 ngày chưa đưa vận chuyển. */
export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;
  try {
    const result = await refundLateCarrierHandoffs();
    const released = await autoReleaseHeldRewards();
    return NextResponse.json({
      success: true,
      ...result,
      ...released,
      message: `Đã hoàn ${result.refundedCount} đơn trễ. Đã nhả ${released.released} đơn có quà.`,
    });
  } catch (error: any) {
    console.error("Cron Error (ship-sla):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
