import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  buildTransferContent,
  buildVietQrImageUrl,
  getEscrowBankAccount,
} from "@/lib/payment/escrow-account";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ pledgeId: string }> }
) {
  const { pledgeId } = await context.params;
  if (!pledgeId) {
    return NextResponse.json({ error: "Thieu ma ung ho" }, { status: 400 });
  }

  const session = await auth();
  const pledge = await prisma.pledges.findUnique({
    where: { id: pledgeId },
    select: {
      id: true,
      userId: true,
      email: true,
      amount: true,
      chargeAmount: true,
      totalAmount: true,
      status: true,
      paymentProvider: true,
      payosOrderCode: true,
      campaignId: true,
      campaigns: { select: { title: true, slug: true } },
    },
  });

  if (!pledge) {
    return NextResponse.json({ error: "Khong tim thay lenh ung ho" }, { status: 404 });
  }

  const email = session?.user?.email?.trim().toLowerCase();
  const owns =
    (session?.user?.id && pledge.userId === session.user.id) ||
    (email && pledge.email?.toLowerCase() === email);
  if (pledge.userId && !owns && (session?.user as { role?: string } | undefined)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Khong co quyen xem lenh chuyen khoan nay" }, { status: 403 });
  }

  const escrow = getEscrowBankAccount();
  const content = pledge.payosOrderCode
    ? pledge.payosOrderCode.replace(/^TUTE/, "TUTE ")
    : buildTransferContent(pledge.id);
  const amount = Number(pledge.chargeAmount || pledge.totalAmount || pledge.amount);

  const note = pledge.campaignId
    ? "Tien vao tai khoan ngan hang trung gian, khong chuyen cho creator. San giu den ngay dong chien dich roi moi chi ho hoac hoan. Du muc tieu giua chung van chay den han."
    : "Tien vao tai khoan ngan hang trung gian cua san. Don hang khong gan chien dich gay quy — doi soat roi giao, khong theo All-or-Nothing.";

  return NextResponse.json({
    pledgeId: pledge.id,
    status: pledge.status,
    amount,
    campaignTitle: pledge.campaigns?.title || null,
    campaignSlug: pledge.campaigns?.slug || null,
    transfer: {
      ...escrow,
      content,
      qrUrl: buildVietQrImageUrl({ amount, addInfo: content, account: escrow }),
    },
    note,
  });
}
