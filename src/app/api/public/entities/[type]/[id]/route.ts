import { NextResponse } from "next/server";
import prisma, { Prisma } from "@/lib/prisma";

const publicTypes = ["campaign", "product", "blog", "project", "profile"] as const;
type PublicType = (typeof publicTypes)[number];

const publicUserSelect = {
  id: true,
  name: true,
  displayName: true,
  avatar: true,
  bio: true,
  location: true,
  coverImage: true,
} as const;

const publicProfileSelect = {
  ...publicUserSelect,
  _count: { select: { projects: true } },
  campaigns: {
    where: { status: { in: ["ACTIVE", "SUCCESS"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, slug: true, title: true, status: true, goalAmount: true, currentAmount: true, _count: { select: { pledges: true } } },
  },
  projects: {
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, slug: true, title: true, description: true, coverImage: true, createdAt: true },
  },
} satisfies Prisma.usersSelect;

const responseHeaders = {
  "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
  "X-Content-Type-Options": "nosniff",
} as const;

function isPublicType(value: string): value is PublicType {
  return publicTypes.includes(value as PublicType);
}

function notFound() {
  return NextResponse.json({ error: "Không tìm thấy dữ liệu công khai." }, { status: 404, headers: responseHeaders });
}

export async function GET(_request: Request, context: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await context.params;
  if (!isPublicType(type) || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,254}$/.test(id)) return notFound();

  try {
    switch (type) {
      case "campaign": {
        const campaign = await prisma.campaigns.findFirst({
          where: { AND: [{ OR: [{ id }, { slug: id }] }, { status: { in: ["ACTIVE", "SUCCESS", "FAILED"] } }] },
          select: {
            id: true, campaignCode: true, slug: true, title: true, description: true, longDescription: true,
            imageUrl: true, images: true, videoUrl: true, category: true, tags: true, type: true,
            goalAmount: true, currentAmount: true, status: true, startDate: true, endDate: true, createdAt: true,
            users: { select: publicUserSelect },
            rewards: { where: { isActive: true }, orderBy: { minAmount: "asc" }, select: { id: true, title: true, description: true, minAmount: true, maxAmount: true, stock: true, productImages: true, productVideo: true, maxQuantity: true, deliveryDate: true, isPreorder: true, onlineDepositPercent: true, codDepositPercent: true } },
            _count: { select: { pledges: true, campaign_followers: true } },
          },
        });
        if (!campaign) return notFound();
        return NextResponse.json({ type, data: { ...campaign, goalAmount: Number(campaign.goalAmount), currentAmount: Number(campaign.currentAmount), rewards: campaign.rewards.map(reward => ({ ...reward, minAmount: Number(reward.minAmount), maxAmount: reward.maxAmount === null ? null : Number(reward.maxAmount), stock: reward.stock, maxQuantity: reward.maxQuantity })) } }, { headers: responseHeaders });
      }
      case "product": {
        const reward = await prisma.rewards.findFirst({
          where: { id, isActive: true },
          select: { id: true, title: true, description: true, minAmount: true, maxAmount: true, stock: true, productImages: true, productVideo: true, maxQuantity: true, deliveryDate: true, isPreorder: true, onlineDepositPercent: true, codDepositPercent: true, createdAt: true, campaigns: { select: { id: true, slug: true, title: true, status: true } }, projects: { select: { id: true, slug: true, title: true } }, product_reviews: { select: { rating: true } }, _count: { select: { pledges: { where: { status: "SUCCESS" } }, product_reviews: true } } },
        });
        if (!reward) return notFound();
        const averageRating = reward.product_reviews.length > 0 ? reward.product_reviews.reduce((sum, review) => sum + review.rating, 0) / reward.product_reviews.length : null;
        return NextResponse.json({ type, data: { ...reward, minAmount: Number(reward.minAmount), maxAmount: reward.maxAmount === null ? null : Number(reward.maxAmount), averageRating, reviewCount: reward._count.product_reviews, soldCount: reward._count.pledges } }, { headers: responseHeaders });
      }
      case "blog": {
        const post = await prisma.blog_posts.findFirst({
          where: { AND: [{ OR: [{ id }, { slug: id }] }, { status: "PUBLISHED" }, { visibility: "PUBLIC" }, { deletedAt: null }] },
          select: { id: true, slug: true, title: true, excerpt: true, content: true, coverImage: true, publishedAt: true, createdAt: true, viewCount: true, likeCount: true, commentCount: true, readingTimeMinutes: true, users: { select: publicUserSelect }, campaigns: { select: { id: true, slug: true, title: true } }, projects: { select: { id: true, slug: true, title: true } } },
        });
        if (!post) return notFound();
        return NextResponse.json({ type, data: post }, { headers: responseHeaders });
      }
      case "project": {
        const project = await prisma.projects.findFirst({
          where: { OR: [{ id }, { slug: id }] },
          select: { id: true, slug: true, title: true, description: true, coverImage: true, createdAt: true, users: { select: publicUserSelect }, _count: { select: { campaigns: true, blog_posts: true, rewards: true } } },
        });
        if (!project) return notFound();
        return NextResponse.json({ type, data: project }, { headers: responseHeaders });
      }
      case "profile": {
        const user = await prisma.users.findUnique({ where: { id }, select: publicProfileSelect });
        if (!user) return notFound();
        const campaigns = user.campaigns.map(campaign => ({ ...campaign, goalAmount: Number(campaign.goalAmount), currentAmount: Number(campaign.currentAmount) }));
        const publicStats = {
          campaignCount: campaigns.length,
          totalRaised: campaigns.reduce((total, campaign) => total + campaign.currentAmount, 0),
          totalBackers: campaigns.reduce((total, campaign) => total + campaign._count.pledges, 0),
        };
        return NextResponse.json({ type, data: { ...user, campaigns, publicStats } }, { headers: responseHeaders });
      }
    }
  } catch (error) {
    console.error("[GET /api/public/entities]", error);
    return NextResponse.json({ error: "Không thể tải dữ liệu công khai." }, { status: 500, headers: responseHeaders });
  }
}
