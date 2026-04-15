import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    pledgeId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { pledgeId } = await params;

    if (!pledgeId) {
      return NextResponse.json(
        { error: "Pledge ID is required" },
        { status: 400 }
      );
    }

    // Tìm pledge trong database
    const pledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!pledge) {
      return NextResponse.json(
        { error: "Pledge not found" },
        { status: 404 }
      );
    }

    // Trả về trạng thái
    return NextResponse.json({
      success: true,
      pledge: {
        id: pledge.id,
        status: pledge.status,
        amount: Number(pledge.amount),
        totalAmount: Number(pledge.totalAmount),
        paymentProvider: pledge.paymentProvider,
        transactionId: pledge.transactionId,
        createdAt: pledge.createdAt,
        updatedAt: pledge.updatedAt,
      },
      campaign: pledge.campaign,
      isPending: pledge.status === "PENDING",
      isSuccess: pledge.status === "SUCCESS",
      isFailed: pledge.status === "FAILED",
    });

  } catch (error: any) {
    console.error("SePay Status Check Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check payment status" },
      { status: 500 }
    );
  }
}
