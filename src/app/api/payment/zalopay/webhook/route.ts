import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { verifyZaloPayCallback } from "@/lib/payment/zalopay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { data?: string; mac?: string; type?: number };
    if (!body.data || !body.mac || !verifyZaloPayCallback(body.data, body.mac)) {
      return NextResponse.json({ return_code: 2, return_message: "invalid callback" }, { status: 400 });
    }
    const callback = JSON.parse(body.data) as { app_trans_id: string; amount: number; zp_trans_id: number };
    const result = await prisma.$transaction(async (tx) => {
      const pledge = await tx.pledges.findUnique({ where: { transactionId: callback.app_trans_id } });
      if (!pledge || pledge.paymentProvider !== "ZALOPAY") return { code: 2, message: "pledge not found" };
      if (pledge.status === "SUCCESS" && pledge.webhookProcessedAt) return { code: 1, message: "already processed" };
      if (Number(pledge.totalAmount) !== Number(callback.amount)) return { code: 2, message: "amount mismatch" };
      await tx.pledges.update({ where: { id: pledge.id }, data: { status: "SUCCESS", webhookProcessedAt: new Date(), updatedAt: new Date() } });
      await tx.campaigns.update({ where: { id: pledge.campaignId }, data: { currentAmount: { increment: pledge.amount } } });
      return { code: 1, message: "success", pledge };
    });
    if (result.code !== 1) return NextResponse.json({ return_code: 2, return_message: result.message }, { status: 400 });
    if ("pledge" in result && result.pledge) await createAuditLog({ userId: result.pledge.userId, action: "UPDATE", entityType: "PLEDGE", entityId: result.pledge.id, oldValue: { status: "PENDING" }, newValue: { status: "SUCCESS", transactionId: String(JSON.parse(body.data).zp_trans_id) }, reason: "ZaloPay payment successful", metadata: { appTransId: JSON.parse(body.data).app_trans_id } });
    return NextResponse.json({ return_code: 1, return_message: "success" });
  } catch (error) {
    console.error("[ZALOPAY WEBHOOK]", error);
    return NextResponse.json({ return_code: 2, return_message: "system error" }, { status: 500 });
  }
}
