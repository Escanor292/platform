import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const METHOD_TYPES = ["CARD", "BANK_ACCOUNT", "MOMO", "ZALOPAY"] as const;

type MethodType = (typeof METHOD_TYPES)[number];

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để xem phương thức đã liên kết" }, { status: 401 });
  }

  const methods = await prisma.payment_methods.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      methodType: true,
      provider: true,
      label: true,
      brand: true,
      last4: true,
      isDefault: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ methods });
}

/**
 * Lưu metadata của phương thức sau khi provider đã xác thực khách hàng và
 * cấp providerMethodRef/token. Không nhận số thẻ, CVV, OTP hoặc mật khẩu.
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để liên kết phương thức thanh toán" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const methodType = body?.methodType as MethodType;
  const provider = typeof body?.provider === "string" ? body.provider.trim().toUpperCase() : "";
  const providerMethodRef = typeof body?.providerMethodRef === "string" ? body.providerMethodRef.trim() : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const brand = typeof body?.brand === "string" ? body.brand.trim() : null;
  const last4 = typeof body?.last4 === "string" ? body.last4.replace(/\D/g, "").slice(-4) : null;
  const isDefault = body?.isDefault === true;

  if (!METHOD_TYPES.includes(methodType) || !provider || !providerMethodRef || !label) {
    return NextResponse.json({
      error: "Thiếu loại phương thức, provider, nhãn hiển thị hoặc token do provider cấp",
    }, { status: 400 });
  }

  if (providerMethodRef.length > 512 || label.length > 120 || provider.length > 40) {
    return NextResponse.json({ error: "Thông tin phương thức thanh toán không hợp lệ" }, { status: 400 });
  }

  const method = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.payment_methods.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { isDefault: false },
      });
    }

    return tx.payment_methods.create({
      data: {
        userId,
        provider,
        methodType,
        label,
        brand: brand || null,
        last4: last4 || null,
        providerMethodRef,
        isDefault,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        methodType: true,
        provider: true,
        label: true,
        brand: true,
        last4: true,
        isDefault: true,
      },
    });
  });

  return NextResponse.json({ method }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu mã phương thức thanh toán" }, { status: 400 });
  }

  const method = await prisma.payment_methods.findFirst({ where: { id, userId } });
  if (!method) {
    return NextResponse.json({ error: "Không tìm thấy phương thức thanh toán" }, { status: 404 });
  }

  await prisma.payment_methods.update({
    where: { id },
    data: { status: "REVOKED", isDefault: false },
  });

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

