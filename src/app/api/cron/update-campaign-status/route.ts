import { NextResponse } from "next/server";
import { closeExpiredCampaigns } from "@/lib/campaign-lifecycle";

/**
 * CRON: Dong chien dich theo ngay het han.
 * Goal chi xet luc het han (AON khong hang). Khong dong som khi du goal.
 */
export async function GET() {
  try {
    const result = await closeExpiredCampaigns();
    return NextResponse.json({
      success: true,
      ...result,
      message: `Da dong ${result.closedCount} chien dich het han.`,
    });
  } catch (error: any) {
    console.error("Cron Error (update status):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
