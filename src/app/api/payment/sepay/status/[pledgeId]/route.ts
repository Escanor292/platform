import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    pledgeId: string;
  }>;
}

export async function GET(request: NextRequest, context: { params: Promise<{ pledgeId: string }> }) {
  try {
    const { pledgeId } = await context.params;

    if (!pledgeId) {
      return NextResponse.json(
        { error: "Pledge ID is required" },
        { status: 400 }
      );
    }

    // Tìm pledge trong database
    const pledge = await prisma.pledges.findUnique({
      where: { id: pledgeId },
      select: { status: true },
    });

    if (!pledge) {
      return NextResponse.json(
        { error: "Pledge not found" },
        { status: 404 }
      );
    }

    // Trả về trạng thái
    return NextResponse.json({
      isPending: pledge.status === "PENDING",
      isSuccess: pledge.status === "SUCCESS",
      isFailed: pledge.status === "FAILED" || pledge.status === "REFUNDED",
    });

  } catch (error: any) {
    console.error("SePay Status Check Error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
