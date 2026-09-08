import { NextResponse } from "next/server";

const BODY = {
  error: "Webhook/cong thanh toan da tat. Tu Te Fund doi soat chuyen khoan ngan hang trung gian qua admin settle.",
  code: "ESCROW_BANK_ONLY",
};

export async function POST() {
  return NextResponse.json(BODY, { status: 410 });
}

export async function GET() {
  return NextResponse.json(BODY, { status: 410 });
}
