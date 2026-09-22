import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getCampaignOwnerStats } from "@/lib/owner-revenue";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const { slug } = await params;
  const campaign = await prisma.campaigns.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    select: { id: true, creatorId: true },
  });
  if (!campaign || campaign.creatorId !== userId) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const stats = await getCampaignOwnerStats(campaign.id);
  return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
}
