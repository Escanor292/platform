import { NextResponse } from "next/server";
import { applyBankCredit, bankCreditAuthorized } from "@/lib/payment/bank-credit";

export async function POST(request: Request) {
  if (!bankCreditAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const result = await applyBankCredit(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[BANK CREDIT]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
