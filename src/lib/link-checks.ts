import { prisma } from "@/lib/prisma";
import { notificationService } from "@/services/mongodb/notification.service";
import { PUBLIC_CAMPAIGN_STATUSES } from "@/lib/moderation/policy";
import { extractHttpUrls, probeHttpUrl } from "@/lib/link-health";

export type LinkEntityType = "blog" | "campaign" | "project" | "product";

type LinkTarget = {
  ownerId: string;
  entityType: LinkEntityType;
  entityId: string;
  entityTitle: string;
  entityPath: string;
  url: string;
};

async function ensureLinkChecksTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS link_checks (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_title TEXT,
      entity_path TEXT,
      url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      http_status INT,
      last_checked_at TIMESTAMPTZ,
      broken_at TIMESTAMPTZ,
      notified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (owner_id, entity_type, entity_id, url)
    )
  `);
}

export async function isCreatorPro(userId: string): Promise<boolean> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { status: true, role: true },
  });
  return user?.status === "PRO";
}

async function collectTargets(ownerIds: string[]): Promise<LinkTarget[]> {
  if (ownerIds.length === 0) return [];
  const [blogs, campaigns, projects, products] = await Promise.all([
    prisma.blog_posts.findMany({
      where: { authorId: { in: ownerIds }, deletedAt: null, status: "PUBLISHED" },
      select: { id: true, authorId: true, title: true, slug: true, content: true, excerpt: true, coverImage: true },
      take: 200,
    }),
    prisma.campaigns.findMany({
      where: { creatorId: { in: ownerIds }, status: { in: [...PUBLIC_CAMPAIGN_STATUSES] as any } },
      select: { id: true, creatorId: true, title: true, slug: true, description: true, longDescription: true, imageUrl: true, videoUrl: true, images: true },
      take: 200,
    }),
    prisma.projects.findMany({
      where: { creatorId: { in: ownerIds }, isLocked: false },
      select: { id: true, creatorId: true, title: true, description: true, coverImage: true },
      take: 200,
    }),
    prisma.rewards.findMany({
      where: { isActive: true, OR: [{ campaigns: { creatorId: { in: ownerIds } } }, { projects: { creatorId: { in: ownerIds } } }] },
      select: {
        id: true, title: true, description: true, productImages: true, productVideo: true,
        campaigns: { select: { creatorId: true } },
        projects: { select: { creatorId: true } },
      },
      take: 200,
    }),
  ]);

  const targets: LinkTarget[] = [];
  const push = (item: Omit<LinkTarget, "url">, urls: string[]) => {
    urls.forEach((url) => targets.push({ ...item, url }));
  };

  for (const post of blogs) {
    push(
      { ownerId: post.authorId, entityType: "blog", entityId: post.id, entityTitle: post.title, entityPath: `/blog/editor?slug=${post.slug}` },
      extractHttpUrls(post.content, post.excerpt, post.coverImage),
    );
  }
  for (const campaign of campaigns) {
    push(
      { ownerId: campaign.creatorId, entityType: "campaign", entityId: campaign.id, entityTitle: campaign.title, entityPath: `/dashboard/creator/edit/${campaign.slug}` },
      extractHttpUrls(campaign.description, campaign.longDescription, campaign.imageUrl, campaign.videoUrl, campaign.images),
    );
  }
  for (const project of projects) {
    push(
      { ownerId: project.creatorId, entityType: "project", entityId: project.id, entityTitle: project.title, entityPath: `/projects/${project.id}` },
      extractHttpUrls(project.description, project.coverImage),
    );
  }
  for (const product of products) {
    const ownerId = product.campaigns?.creatorId || product.projects?.creatorId;
    if (!ownerId || !ownerIds.includes(ownerId)) continue;
    push(
      { ownerId, entityType: "product", entityId: product.id, entityTitle: product.title, entityPath: `/products/${product.id}` },
      extractHttpUrls(product.description, product.productVideo, product.productImages),
    );
  }
  return targets;
}

async function upsertTargets(targets: LinkTarget[]) {
  for (const target of targets) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO link_checks (id, owner_id, entity_type, entity_id, entity_title, entity_path, url, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       ON CONFLICT (owner_id, entity_type, entity_id, url)
       DO UPDATE SET entity_title = EXCLUDED.entity_title, entity_path = EXCLUDED.entity_path`,
      crypto.randomUUID(),
      target.ownerId,
      target.entityType,
      target.entityId,
      target.entityTitle,
      target.entityPath,
      target.url,
    );
  }
}

export async function listBrokenLinks(ownerId: string) {
  await ensureLinkChecksTable();
  return prisma.$queryRawUnsafe<Array<{
    id: string;
    entity_type: string;
    entity_title: string;
    entity_path: string;
    url: string;
    http_status: number | null;
    last_checked_at: Date | null;
  }>>(
    `SELECT id, entity_type, entity_title, entity_path, url, http_status, last_checked_at
     FROM link_checks
     WHERE owner_id = $1 AND status = 'broken'
     ORDER BY last_checked_at DESC NULLS LAST
     LIMIT 50`,
    ownerId,
  );
}

export async function scanCreatorLinks(options?: { ownerId?: string; limit?: number }) {
  await ensureLinkChecksTable();
  const limit = Math.min(options?.limit || 20, 40);
  let ownerIds = options?.ownerId ? [options.ownerId] : [];
  if (ownerIds.length === 0) {
    const pros = await prisma.users.findMany({
      where: { status: "PRO" },
      select: { id: true },
      take: 50,
    });
    ownerIds = pros.map((user) => user.id);
  } else {
    const allowed = await isCreatorPro(ownerIds[0]);
    if (!allowed) return { checked: 0, broken: 0, notified: 0, skipped: true as const };
  }
  if (ownerIds.length === 0) {
    return { checked: 0, broken: 0, notified: 0, skipped: false as const };
  }

  const targets = await collectTargets(ownerIds);
  await upsertTargets(targets);

  const params = [...ownerIds, limit];
  const idList = ownerIds.map((_, index) => `$${index + 1}`).join(", ");
  const due = await prisma.$queryRawUnsafe<Array<{
    id: string;
    owner_id: string;
    entity_title: string;
    entity_path: string;
    url: string;
    status: string;
    notified_at: Date | null;
  }>>(
    `SELECT id, owner_id, entity_title, entity_path, url, status, notified_at
     FROM link_checks
     WHERE owner_id IN (${idList})
     ORDER BY last_checked_at ASC NULLS FIRST
     LIMIT $${ownerIds.length + 1}`,
    ...params,
  );

  let broken = 0;
  let notified = 0;
  for (const row of due) {
    const result = await probeHttpUrl(row.url);
    const nextStatus = result.ok ? "ok" : "broken";
    if (!result.ok) broken += 1;
    const shouldNotify = !result.ok && (!row.notified_at || Date.now() - new Date(row.notified_at).getTime() > 7 * 24 * 60 * 60 * 1000);
    await prisma.$executeRawUnsafe(
      `UPDATE link_checks
       SET status = $2,
           http_status = $3,
           last_checked_at = NOW(),
           broken_at = CASE WHEN $2 = 'broken' THEN COALESCE(broken_at, NOW()) ELSE NULL END,
           notified_at = CASE WHEN $4 THEN NOW() ELSE notified_at END
       WHERE id = $1`,
      row.id,
      nextStatus,
      result.status,
      shouldNotify,
    );
    if (shouldNotify) {
      notified += 1;
      notificationService.send({
        userId: row.owner_id,
        type: "BROKEN_LINK",
        title: "Link trong nội dung bị hỏng",
        message: `Link trên “${row.entity_title}” không mở được${result.status ? ` (mã ${result.status})` : ""}.`,
        payload: { href: row.entity_path, extra: { url: row.url } },
      });
    }
  }

  return { checked: due.length, broken, notified, skipped: false as const };
}
