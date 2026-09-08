import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROFILE_CUSTOMIZATION,
  normalizeProfileCustomization,
  parseProfileCustomization,
  type ProfileCustomizationConfig,
} from "@/lib/profile-customization";
import { NextResponse } from "next/server";
import { permissionDenied, userHasPermission } from "@/lib/permissions";

const cloneDefault = () => JSON.parse(JSON.stringify(DEFAULT_PROFILE_CUSTOMIZATION)) as ProfileCustomizationConfig;

type CustomizationAction = "save" | "publish" | "restore" | "restore_version" | "reset";

async function requireCustomize() {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await userHasPermission(session.user as any, "profile.customize"))) {
    return { error: NextResponse.json(permissionDenied("Tài khoản này không được tùy chỉnh giao diện hồ sơ."), { status: 403 }) };
  }
  return {};
}

async function getCurrentUserId() {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.id) return session.user.id;
  if (!session.user.email) return null;

  const user = await prisma.users.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function ensureCustomization(userId: string) {
  return prisma.profile_customizations.upsert({
    where: { userId },
    create: {
      userId,
      draftConfig: cloneDefault() as any,
      publishedConfig: cloneDefault() as any,
    },
    update: {},
  });
}

async function validateFeaturedOwnership(config: ProfileCustomizationConfig, userId: string) {
  const [projects, campaigns, blogPosts, rewards] = await Promise.all([
    prisma.projects.findMany({
      where: { id: { in: config.featured.projectIds }, creatorId: userId },
      select: { id: true },
    }),
    prisma.campaigns.findMany({
      where: { id: { in: config.featured.campaignIds }, creatorId: userId },
      select: { id: true },
    }),
    prisma.blog_posts.findMany({
      where: { id: { in: config.featured.blogPostIds }, authorId: userId, deletedAt: null },
      select: { id: true },
    }),
    prisma.rewards.findMany({
      where: {
        id: { in: config.featured.rewardIds },
        OR: [
          { campaigns: { creatorId: userId } },
          { projects: { creatorId: userId } },
        ],
      },
      select: { id: true },
    }),
  ]);

  const allowed = {
    projectIds: new Set(projects.map((item) => item.id)),
    campaignIds: new Set(campaigns.map((item) => item.id)),
    blogPostIds: new Set(blogPosts.map((item) => item.id)),
    rewardIds: new Set(rewards.map((item) => item.id)),
  };

  const invalid = [
    ...config.featured.projectIds.filter((id) => !allowed.projectIds.has(id)),
    ...config.featured.campaignIds.filter((id) => !allowed.campaignIds.has(id)),
    ...config.featured.blogPostIds.filter((id) => !allowed.blogPostIds.has(id)),
    ...config.featured.rewardIds.filter((id) => !allowed.rewardIds.has(id)),
  ];

  if (invalid.length > 0) {
    throw new Error("Một hoặc nhiều nội dung nổi bật không thuộc tài khoản của bạn");
  }
}

function jsonConfig(value: unknown) {
  return value as any;
}

export async function GET() {
  try {
    const gate = await requireCustomize();
    if (gate.error) return gate.error;
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const customization = await ensureCustomization(userId);
    const [projects, campaigns, rewards, blogPosts] = await Promise.all([
      prisma.projects.findMany({
        where: { creatorId: userId },
        select: { id: true, title: true, slug: true },
        orderBy: { updatedAt: "desc" },
        take: 24,
      }),
      prisma.campaigns.findMany({
        where: { creatorId: userId },
        select: { id: true, title: true, slug: true, status: true },
        orderBy: { updatedAt: "desc" },
        take: 24,
      }),
      prisma.rewards.findMany({
        where: {
          OR: [{ campaigns: { creatorId: userId } }, { projects: { creatorId: userId } }],
          isActive: true,
        },
        select: { id: true, title: true, projectId: true, campaignId: true },
        orderBy: { updatedAt: "desc" },
        take: 36,
      }),
      prisma.blog_posts.findMany({
        where: { authorId: userId, deletedAt: null },
        select: { id: true, title: true, slug: true, status: true, visibility: true },
        orderBy: { updatedAt: "desc" },
        take: 24,
      }),
    ]);

    return NextResponse.json({
      draft: normalizeProfileCustomization(customization.draftConfig),
      published: normalizeProfileCustomization(customization.publishedConfig),
      draftVersion: customization.draftVersion,
      publishedVersion: customization.publishedVersion,
      publishedAt: customization.publishedAt,
      updatedAt: customization.updatedAt,
      versions: await prisma.profile_customization_versions.findMany({
        where: { customizationId: customization.id },
        select: { id: true, version: true, action: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      options: { projects, campaigns, rewards, blogPosts },
    });
  } catch (error) {
    console.error("[GET /api/profile/customization]", error);
    return NextResponse.json({ error: "Không thể tải cấu hình trang cá nhân" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const gate = await requireCustomize();
    if (gate.error) return gate.error;
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const action = (body.action || "save") as CustomizationAction;
    if (!["save", "publish", "restore", "restore_version", "reset"].includes(action)) {
      return NextResponse.json({ error: "Thao tác không hợp lệ" }, { status: 400 });
    }

    const existing = await ensureCustomization(userId);
    let source: unknown = body.config;
    if (action === "restore") source = existing.publishedConfig;
    if (action === "restore_version") {
      const versionId = typeof body.versionId === "string" ? body.versionId : "";
      const version = await prisma.profile_customization_versions.findFirst({
        where: { id: versionId, customizationId: existing.id },
        select: { config: true },
      });
      if (!version) return NextResponse.json({ error: "Không tìm thấy phiên bản cần khôi phục" }, { status: 404 });
      source = version.config;
    }
    const parsed = action === "reset"
      ? parseProfileCustomization(cloneDefault())
      : parseProfileCustomization(normalizeProfileCustomization(source));
    if (!parsed.success) {
      return NextResponse.json({ error: "Cấu hình giao diện không hợp lệ" }, { status: 400 });
    }

    await validateFeaturedOwnership(parsed.data, userId);

    const update = action === "publish"
      ? {
          draftConfig: jsonConfig(parsed.data),
          publishedConfig: jsonConfig(parsed.data),
          draftVersion: { increment: 1 },
          publishedVersion: { increment: 1 },
          publishedAt: new Date(),
        }
      : {
          draftConfig: jsonConfig(parsed.data),
          draftVersion: { increment: 1 },
          ...(action === "restore" ? { publishedConfig: jsonConfig(parsed.data) } : {}),
        };

    const updated = await prisma.profile_customizations.update({
      where: { userId },
      data: update,
    });

    await prisma.profile_customization_versions.create({
      data: {
        customizationId: updated.id,
        version: updated.draftVersion,
        action,
        config: jsonConfig(parsed.data),
      },
    });

    return NextResponse.json({
      success: true,
      action,
      draft: normalizeProfileCustomization(updated.draftConfig),
      published: normalizeProfileCustomization(updated.publishedConfig),
      draftVersion: updated.draftVersion,
      publishedVersion: updated.publishedVersion,
      publishedAt: updated.publishedAt,
      versions: await prisma.profile_customization_versions.findMany({
        where: { customizationId: updated.id },
        select: { id: true, version: true, action: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("không thuộc")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[PATCH /api/profile/customization]", error);
    return NextResponse.json({ error: "Không thể lưu cấu hình trang cá nhân" }, { status: 500 });
  }
}
