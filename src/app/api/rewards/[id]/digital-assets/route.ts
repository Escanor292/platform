import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TYPES = ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const actorId = (session?.user as { id?: string; role?: string; isAdmin?: boolean } | undefined)?.id;
  if (!actorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: rewardId } = await context.params;
  const reward = await prisma.rewards.findUnique({
    where: { id: rewardId },
    select: { id: true, fulfillmentType: true, campaignId: true, projects: { select: { creatorId: true } }, campaigns: { select: { creatorId: true } } },
  });
  if (!reward) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });

  const isOwner = Boolean(
    (session?.user as { role?: string; isAdmin?: boolean } | undefined)?.role === "ADMIN" ||
    (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true ||
    reward.projects?.creatorId === actorId ||
    reward.campaigns?.creatorId === actorId,
  );
  if (!isOwner) return NextResponse.json({ error: "Bạn không có quyền cấp tài sản cho sản phẩm này" }, { status: 403 });
  if (!TYPES.includes(reward.fulfillmentType as (typeof TYPES)[number])) return NextResponse.json({ error: "Sản phẩm không phải tài sản số" }, { status: 400 });

  const body = await request.json();
  const pledgeId = typeof body.pledgeId === "string" ? body.pledgeId : null;
  const assetUrl = typeof body.assetUrl === "string" ? body.assetUrl.trim().slice(0, 2000) : null;
  const encryptedValue = typeof body.encryptedValue === "string" ? body.encryptedValue.trim().slice(0, 5000) : null;
  const deliveryEmail = typeof body.deliveryEmail === "string" ? body.deliveryEmail.trim().slice(0, 320) : null;
  if (!assetUrl && !encryptedValue) return NextResponse.json({ error: "Cần assetUrl hoặc encryptedValue đã mã hóa" }, { status: 400 });

  if (pledgeId) {
    const pledge = await prisma.pledges.findFirst({ where: { id: pledgeId, rewardId, status: "SUCCESS" }, select: { id: true, campaignId: true, email: true } });
    if (!pledge) return NextResponse.json({ error: "Không tìm thấy purchase hợp lệ" }, { status: 404 });
    const asset = await prisma.reward_digital_assets.upsert({
      where: { pledgeId },
      update: { assetType: reward.fulfillmentType, assetUrl, encryptedValue, deliveryEmail: deliveryEmail || pledge.email, status: "AVAILABLE", updatedAt: new Date() },
      create: { rewardId, campaignId: pledge.campaignId, pledgeId, assetType: reward.fulfillmentType, assetUrl, encryptedValue, deliveryEmail: deliveryEmail || pledge.email, status: "AVAILABLE" },
    });
    return NextResponse.json({ asset: { id: asset.id, pledgeId: asset.pledgeId, status: asset.status } });
  }

  const asset = await prisma.reward_digital_assets.create({
    data: { rewardId, campaignId: reward.campaignId, assetType: reward.fulfillmentType, assetUrl, encryptedValue, deliveryEmail, status: "AVAILABLE" },
  });
  return NextResponse.json({ asset: { id: asset.id, status: asset.status } }, { status: 201 });
}
