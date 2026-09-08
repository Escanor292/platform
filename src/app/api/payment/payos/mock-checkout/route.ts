import { NextResponse } from "next/server";

const BODY = {
  error: "Webhook/cổng thanh toán đã tắt. Tử Tế Fund đối soát chuyển khoản ngân hàng trung gian qua admin settle.",
  code: "ESCROW_BANK_ONLY",
};

export async function POST() {
  return NextResponse.json(BODY, { status: 410 });
}

export async function GET() {
  return NextResponse.json(BODY, { status: 410 });
}
