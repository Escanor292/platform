import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { canPublishTiers, MAX_ACTIVE_TIERS } from "@/lib/membership";
import { MIN_DONATION_AMOUNT } from "@/lib/payment/pledge-charge";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  const tiers = await prisma.support_tiers.findMany({
    where: { creatorId: userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({
    tiers: tiers.map((tier) => ({
      id: tier.id,
      title: tier.title,
      description: tier.description,
      amount: Number(tier.amount),
      isActive: tier.isActive,
      sortOrder: tier.sortOrder,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string; isAdmin?: boolean } | undefined;
  if (!user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  if (!canPublishTiers(user)) {
    return NextResponse.json({ error: "Chỉ Creator đã được duyệt mới mở mức ủng hộ dài lâu" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 80) : "";
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 400) : "";
  const amount = Number(body?.amount);
  if (!title || !Number.isInteger(amount) || amount < MIN_DONATION_AMOUNT || amount > 100_000_000) {
    return NextResponse.json({ error: "Tên và số tiền mỗi tháng chưa hợp lệ. Tối thiểu 50.000đ." }, { status: 400 });
  }
  const activeCount = await prisma.support_tiers.count({ where: { creatorId: user.id, isActive: true } });
  if (activeCount >= MAX_ACTIVE_TIERS) {
    return NextResponse.json({ error: "Tối đa 4 mức đang mở" }, { status: 400 });
  }
  const now = new Date();
  const tier = await prisma.support_tiers.create({
    data: {
      id: crypto.randomUUID(),
      creatorId: user.id,
      title,
      description: description || null,
      amount: new Decimal(amount),
      sortOrder: activeCount,
      updatedAt: now,
    },
  });
  return NextResponse.json({ id: tier.id }, { status: 201 });
}
