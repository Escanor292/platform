import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Cổng thanh toán này đã tắt. Tử Tế Fund dùng tài khoản ngân hàng trung gian; creator không liên kết PayOS/MoMo/VNPay/SePay.",
      code: "ESCROW_BANK_ONLY",
    },
    { status: 410 }
  );
}
