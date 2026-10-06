import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMembershipPledge } from "@/lib/membership";

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!user?.id) return NextResponse.json({ error: "Bạn cần đăng nhập để ủng hộ dài lâu" }, { status: 401 });
  const email = user.email?.trim().toLowerCase() || "";
  if (!email) return NextResponse.json({ error: "Tài khoản chưa có email để nhận chứng từ" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const tierId = typeof body?.tierId === "string" ? body.tierId.trim() : "";
  if (!tierId) return NextResponse.json({ error: "Thiếu mức ủng hộ" }, { status: 400 });

  const result = await createMembershipPledge({
    userId: user.id,
    email,
    name: user.name?.trim() || "Người ủng hộ",
    tierId,
    isAnonymous: body?.isAnonymous === true,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const creatorId = typeof body?.creatorId === "string" ? body.creatorId.trim() : "";
  if (!creatorId) return NextResponse.json({ error: "Thiếu người nhận ủng hộ" }, { status: 400 });
  if (body?.resume === true) {
    const resumed = await prisma.memberships.updateMany({
      where: { supporterId: userId, creatorId, status: "ACTIVE", canceledAt: { not: null } },
      data: { canceledAt: null, updatedAt: new Date() },
    });
    if (resumed.count !== 1) return NextResponse.json({ error: "Không có kỳ nào đang dừng" }, { status: 404 });
    return NextResponse.json({ ok: true, message: "Đã giữ tiếp các kỳ sau." });
  }
  const updated = await prisma.memberships.updateMany({
    where: { supporterId: userId, creatorId, status: "ACTIVE", canceledAt: null },
    data: { canceledAt: new Date(), updatedAt: new Date() },
  });
  if (updated.count !== 1) return NextResponse.json({ error: "Không có hội viên đang chạy để dừng" }, { status: 404 });
  return NextResponse.json({ ok: true, message: "Đã dừng kỳ sau. Kỳ đang chạy vẫn giữ đến hết hạn." });
}

