import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { persistRichText, RichTextValidationError } from "@/lib/editor/persist";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const where: any = { campaignId: campaign.id };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } }
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const updates = await prisma.campaign_updates.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json(updates);
  } catch (error: any) {
    console.error("[UPDATES_GET_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const { title, content, imageUrl, tags, isPinned } = await req.json();

    const campaign = await prisma.campaigns.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, creatorId: true }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.creatorId !== (session.user as any).id) {
      return NextResponse.json({ error: "Bạn không có quyền đăng cập nhật cho dự án này" }, { status: 403 });
    }

    let safeContent = "";
    try {
      safeContent = persistRichText(content || "");
    } catch (error) {
      if (error instanceof RichTextValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    const update = await prisma.campaign_updates.create({
      data: {
        id: crypto.randomUUID(),
        campaignId: campaign.id,
        title,
        content: safeContent,
        imageUrl,
        tags: tags || [],
        isPinned: isPinned || false,
      }
    });

    return NextResponse.json(update);
  } catch (error: any) {
    console.error("[UPDATES_POST_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
