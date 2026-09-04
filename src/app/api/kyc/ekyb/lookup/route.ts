import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { lookupBusiness } from "@/lib/ekyc/ekyb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const taxCode = request.nextUrl.searchParams.get("taxCode") || "";
    const record = await lookupBusiness(taxCode);
    if (!record) {
      return NextResponse.json({ error: "MST phai gom 10 hoac 13 so" }, { status: 400 });
    }
    return NextResponse.json({ business: record });
  } catch (error: any) {
    console.error("[EKYB LOOKUP]", error);
    return NextResponse.json({ error: error.message || "Khong tra cuu duoc MST" }, { status: 500 });
  }
}
