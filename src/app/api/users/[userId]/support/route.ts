import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const [tiers, members] = await Promise.all([
    prisma.support_tiers.findMany({
      where: { creatorId: userId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { amount: "asc" }],
      select: { id: true, title: true, description: true, amount: true },
    }),
    prisma.memberships.findMany({
      where: { creatorId: userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        isAnonymous: true,
        supporter: { select: { name: true, displayName: true } },
        support_tiers: { select: { title: true } },
      },
    }),
  ]);
  return NextResponse.json({
    tiers: tiers.map((tier) => ({ ...tier, amount: Number(tier.amount) })),
    memberCount: await prisma.memberships.count({ where: { creatorId: userId, status: "ACTIVE" } }),
    members: members.map((member) => ({
      id: member.id,
      name: member.isAnonymous ? "Ẩn danh" : (member.supporter.displayName || member.supporter.name),
      tierTitle: member.support_tiers.title,
    })),
  });
}
