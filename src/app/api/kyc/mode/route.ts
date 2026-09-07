import { NextResponse } from "next/server";
import { isEkycEnabled } from "@/lib/platform-settings";

export async function GET() {
  const ekycEnabled = await isEkycEnabled();
  return NextResponse.json({
    ekycEnabled,
    kycMode: ekycEnabled ? "EKYC" : "MANUAL",
  });
}
