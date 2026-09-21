import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { catalogQueryFromQuestion, type CatalogHit } from "@/lib/public-catalog-search";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q")?.trim() || "";
  const query = catalogQueryFromQuestion(raw) || raw.slice(0, 80);
  if (query.length < 2) {
    return NextResponse.json({ query, hits: [] as CatalogHit[] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const [projects, campaigns, posts, products, users] = await Promise.all([
      prisma.projects.findMany({
        where: { isLocked: false, OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }] },
        select: { id: true, title: true, description: true, slug: true },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.campaigns.findMany({
        where: {
          status: { in: ["ACTIVE", "SUCCESS"] },
          OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { campaignCode: { contains: query, mode: "insensitive" } }],
        },
        select: { title: true, slug: true, description: true },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.blog_posts.findMany({
        where: {
          deletedAt: null,
          status: "PUBLISHED",
          visibility: "PUBLIC",
          OR: [{ title: { contains: query, mode: "insensitive" } }, { excerpt: { contains: query, mode: "insensitive" } }],
        },
        select: { title: true, slug: true, excerpt: true },
        take: 5,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.rewards.findMany({
        where: {
          isActive: true,
          OR: [{ title: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }],
        },
        select: { id: true, title: true, description: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.users.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 4,
        orderBy: { name: "asc" },
      }),
    ]);

    const hits: CatalogHit[] = [
      ...projects.map(item => ({ type: "project" as const, title: item.title, href: `/projects/${item.slug || item.id}`, excerpt: item.description?.slice(0, 120) })),
      ...campaigns.map(item => ({ type: "campaign" as const, title: item.title, href: `/campaigns/${item.slug}`, excerpt: item.description.slice(0, 120) })),
      ...posts.map(item => ({ type: "blog" as const, title: item.title, href: `/blog/${item.slug}`, excerpt: item.excerpt?.slice(0, 120) })),
      ...products.map(item => ({ type: "product" as const, title: item.title, href: `/products/${item.id}`, excerpt: item.description?.slice(0, 120) })),
      ...users.map(item => ({ type: "profile" as const, title: item.name, href: `/profile/${item.id}` })),
    ].slice(0, 12);

    return NextResponse.json({ query, hits }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[GET /api/public/catalog-search]", error);
    return NextResponse.json({ query, hits: [] as CatalogHit[], error: "Không tìm được dữ liệu công khai" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
