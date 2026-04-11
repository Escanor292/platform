import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sepay } from "@/lib/payment/sepay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-sepay-signature") || "";

    console.log("SePay Webhook received:", body);

    // 1. Verify webhook signature (nếu có)
    if (process.env.SEPAY_API_KEY && signature) {
      const isValid = sepay.verifyWebhook(signature, body);
      if (!isValid) {
        console.error("Invalid SePay webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // 2. Parse transaction data
    const transaction = sepay.parseTransaction(body);
    
    // 3. Extract pledge ID từ nội dung chuyển khoản
    const pledgeId = sepay.extractOrderId(transaction.content);
    
    if (!pledgeId) {
      console.error("Cannot extract pledge ID from content:", transaction.content);
      return NextResponse.json(
        { error: "Invalid transaction content" },
        { status: 400 }
      );
    }

    // 4. Tìm Pledge trong database
    const pledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: { campaign: true },
    });

    if (!pledge) {
      console.error("Pledge not found:", pledgeId);
      return NextResponse.json(
        { error: "Pledge not found" },
        { status: 404 }
      );
    }

    // 5. Kiểm tra nếu đã xử lý rồi
    if (pledge.status === "SUCCESS") {
      console.log("Pledge already processed:", pledgeId);
      return NextResponse.json({ 
        success: true, 
        message: "Already processed" 
      });
    }

    // 6. Kiểm tra số tiền khớp
    const expectedAmount = Number(pledge.totalAmount);
    const receivedAmount = transaction.amount;

    if (Math.abs(expectedAmount - receivedAmount) > 1) {
      console.error("Amount mismatch:", { expected: expectedAmount, received: receivedAmount });
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // 7. Cập nhật Pledge thành SUCCESS
    await prisma.pledge.update({
      where: { id: pledgeId },
      data: {
        status: "SUCCESS",
        transactionId: transaction.transactionId,
        updatedAt: new Date(),
      },
    });

    // 8. Cộng tiền vào Campaign
    await prisma.campaign.update({
      where: { id: pledge.campaignId },
      data: {
        currentAmount: {
          increment: pledge.amount,
        },
      },
    });

    // 9. Kiểm tra nếu Campaign đạt mục tiêu
    const updatedCampaign = await prisma.campaign.findUnique({
      where: { id: pledge.campaignId },
    });

    if (
      updatedCampaign &&
      Number(updatedCampaign.currentAmount) >= Number(updatedCampaign.goalAmount) &&
      updatedCampaign.status === "ACTIVE"
    ) {
      await prisma.campaign.update({
        where: { id: pledge.campaignId },
        data: { status: "SUCCESS" },
      });
      console.log("Campaign reached goal:", pledge.campaignId);
    }

    console.log("SePay payment processed successfully:", pledgeId);

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      pledgeId,
      transactionId: transaction.transactionId,
    });

  } catch (error: any) {
    console.error("SePay Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET endpoint để test webhook
export async function GET() {
  return NextResponse.json({
    message: "SePay Webhook Endpoint",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/sepay/webhook`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sepay-signature": "optional_signature",
    },
  });
}
