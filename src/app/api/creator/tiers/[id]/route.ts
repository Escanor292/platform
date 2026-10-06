import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { MIN_DONATION_AMOUNT } from "@/lib/payment/pledge-charge";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  const { id } = await context.params;
  const tier = await prisma.support_tiers.findUnique({ where: { id }, select: { creatorId: true } });
  if (!tier || tier.creatorId !== userId) return NextResponse.json({ error: "Không tìm thấy mức ủng hộ" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const data: { title?: string; description?: string | null; amount?: Decimal; isActive?: boolean; updatedAt: Date } = {
    updatedAt: new Date(),
  };
  if (typeof body?.title === "string") {
    const title = body.title.trim().slice(0, 80);
    if (!title) return NextResponse.json({ error: "Tên không hợp lệ" }, { status: 400 });
    data.title = title;
  }
  if (typeof body?.description === "string") data.description = body.description.trim().slice(0, 400) || null;
  if (body?.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < MIN_DONATION_AMOUNT || amount > 100_000_000) {
      return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
    }
    data.amount = new Decimal(amount);
  }
  if (typeof body?.isActive === "boolean") data.isActive = body.isActive;
  await prisma.support_tiers.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
