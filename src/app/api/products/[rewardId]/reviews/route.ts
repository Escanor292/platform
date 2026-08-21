import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MEDIA_URL_PATTERN = /^https?:\/\//i;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ rewardId: string }> },
) {
  try {
    const { rewardId } = await context.params;
    const reward = await prisma.rewards.findUnique({
      where: { id: rewardId },
      select: { id: true },
    });

    if (!reward) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    const reviews = await prisma.product_reviews.findMany({
      where: { rewardId },
      include: { users: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });

    const session = await auth();
    const userId = session?.user?.id;
    let eligibility = {
      isLoggedIn: Boolean(userId),
      canConfirmReceipt: false,
      canReview: false,
      hasReviewed: false,
    };

    if (userId) {
      const pledge = await prisma.pledges.findFirst({
        where: { rewardId, userId, status: "SUCCESS" },
        select: { id: true, receivedAt: true, product_reviews: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      });
      const hasReviewed = Boolean(pledge?.product_reviews);
      eligibility = {
        isLoggedIn: true,
        canConfirmReceipt: Boolean(pledge && !pledge.receivedAt),
        canReview: Boolean(pledge?.receivedAt && !hasReviewed),
        hasReviewed,
      };
    }

    return NextResponse.json({ reviews, eligibility });
  } catch (error) {
    console.error("[PRODUCT_REVIEWS_GET_ERROR]", error);
    return NextResponse.json({ error: "Không thể tải đánh giá sản phẩm" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ rewardId: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để đánh giá" }, { status: 401 });
    }

    const { rewardId } = await context.params;
    const body = await request.json();
    const rating = Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls.filter((url: unknown): url is string => typeof url === "string") : [];

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Số sao phải từ 1 đến 5" }, { status: 400 });
    }
    if (comment.length < 5 || comment.length > 2000) {
      return NextResponse.json({ error: "Bình luận phải dài từ 5 đến 2.000 ký tự" }, { status: 400 });
    }
    if (mediaUrls.length > 6 || mediaUrls.some((url: string) => !MEDIA_URL_PATTERN.test(url))) {
      return NextResponse.json({ error: "Tối đa 6 ảnh/video hợp lệ" }, { status: 400 });
    }

    const pledge = await prisma.pledges.findFirst({
      where: { rewardId, userId, status: "SUCCESS", receivedAt: { not: null } },
      select: { id: true },
    });
    if (!pledge) {
      return NextResponse.json({ error: "Bạn chỉ có thể đánh giá sau khi đã nhận hàng" }, { status: 403 });
    }

    const existing = await prisma.product_reviews.findUnique({ where: { pledgeId: pledge.id } });
    if (existing) {
      return NextResponse.json({ error: "Bạn đã đánh giá sản phẩm này" }, { status: 409 });
    }

    const review = await prisma.product_reviews.create({
      data: {
        id: crypto.randomUUID(),
        rewardId,
        pledgeId: pledge.id,
        userId,
        rating,
        comment,
        mediaUrls,
        updatedAt: new Date(),
      },
      include: { users: { select: { name: true, avatar: true } } },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[PRODUCT_REVIEWS_POST_ERROR]", error);
    return NextResponse.json({ error: "Không thể gửi đánh giá" }, { status: 500 });
  }
}
