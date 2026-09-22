import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProductOwnerStats } from "@/lib/owner-revenue";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ rewardId: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const { rewardId } = await params;
  const reward = await prisma.rewards.findUnique({
    where: { id: rewardId },
    select: {
      id: true,
      campaigns: { select: { creatorId: true } },
      projects: { select: { creatorId: true } },
    },
  });
  const ownerIds = [reward?.campaigns?.creatorId, reward?.projects?.creatorId].filter(Boolean);
  if (!reward || !ownerIds.includes(userId)) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const stats = await getProductOwnerStats(rewardId);
  return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
}
