import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  applyShareableTemplate,
  DEFAULT_PROFILE_CUSTOMIZATION,
  normalizeProfileCustomization,
  parseProfileCustomization,
  toShareableTemplate,
  type ProfileCustomizationConfig,
} from "@/lib/profile-customization";
import { userHasPermission } from "@/lib/permissions";

export const MAX_TEMPLATES_PER_USER = 10;
export const MAX_PUBLIC_TEMPLATES = 3;

export type TemplateVisibility = "PRIVATE" | "UNLISTED" | "PUBLIC";
export type TemplateStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

export type ProfileTemplateRecord = {
  id: string;
  slug: string;
  authorId: string;
  title: string;
  description: string;
  visibility: TemplateVisibility;
  status: TemplateStatus;
  config: ProfileCustomizationConfig;
  useCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authorName?: string;
  authorAvatar?: string | null;
};

type TemplateRow = {
  id: string;
  slug: string;
  author_id: string;
  title: string;
  description: string;
  visibility: TemplateVisibility;
  status: TemplateStatus;
  config: unknown;
  use_count: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  author_name?: string;
  author_avatar?: string | null;
};

async function ensureProfileTemplatesTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS profile_templates (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      visibility TEXT NOT NULL DEFAULT 'PRIVATE',
      status TEXT NOT NULL DEFAULT 'DRAFT',
      config JSONB NOT NULL,
      use_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS profile_templates_public_idx
    ON profile_templates (status, visibility, use_count DESC)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS profile_templates_author_idx
    ON profile_templates (author_id)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS profile_template_uses (
      template_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (template_id, user_id)
    )
  `);
}

function mapRow(row: TemplateRow): ProfileTemplateRecord {
  return {
    id: row.id,
    slug: row.slug,
    authorId: row.author_id,
    title: row.title,
    description: row.description || "",
    visibility: row.visibility,
    status: row.status,
    config: normalizeProfileCustomization(row.config),
    useCount: Number(row.use_count || 0),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
  };
}

export function slugifyTitle(title: string) {
  const base =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "mau";
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanText(value: unknown, max: number) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export async function getSessionUserId() {
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

export async function listMine(authorId: string) {
  await ensureProfileTemplatesTable();
  const rows = await prisma.$queryRawUnsafe<TemplateRow[]>(
    `SELECT t.*, u.name AS author_name, COALESCE(u.image, u.avatar) AS author_avatar
     FROM profile_templates t
     LEFT JOIN users u ON u.id = t.author_id
     WHERE t.author_id = $1
     ORDER BY t.updated_at DESC`,
    authorId,
  );
  return rows.map(mapRow);
}

export async function listPublic(limit = 24) {
  await ensureProfileTemplatesTable();
  const rows = await prisma.$queryRawUnsafe<TemplateRow[]>(
    `SELECT t.*, u.name AS author_name, COALESCE(u.image, u.avatar) AS author_avatar
     FROM profile_templates t
     LEFT JOIN users u ON u.id = t.author_id
     WHERE t.visibility = 'PUBLIC' AND t.status = 'PUBLISHED'
     ORDER BY t.use_count DESC, t.published_at DESC NULLS LAST
     LIMIT $1`,
    limit,
  );
  return rows.map(mapRow);
}

export async function listPending(limit = 50) {
  await ensureProfileTemplatesTable();
  const rows = await prisma.$queryRawUnsafe<TemplateRow[]>(
    `SELECT t.*, u.name AS author_name, COALESCE(u.image, u.avatar) AS author_avatar
     FROM profile_templates t
     LEFT JOIN users u ON u.id = t.author_id
     WHERE t.visibility = 'PUBLIC' AND t.status = 'PENDING'
     ORDER BY t.updated_at ASC
     LIMIT $1`,
    limit,
  );
  return rows.map(mapRow);
}

export async function getTemplateById(id: string) {
  await ensureProfileTemplatesTable();
  const rows = await prisma.$queryRawUnsafe<TemplateRow[]>(
    `SELECT t.*, u.name AS author_name, COALESCE(u.image, u.avatar) AS author_avatar
     FROM profile_templates t
     LEFT JOIN users u ON u.id = t.author_id
     WHERE t.id = $1
     LIMIT 1`,
    id,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getTemplateBySlug(slug: string) {
  await ensureProfileTemplatesTable();
  const rows = await prisma.$queryRawUnsafe<TemplateRow[]>(
    `SELECT t.*, u.name AS author_name, COALESCE(u.image, u.avatar) AS author_avatar
     FROM profile_templates t
     LEFT JOIN users u ON u.id = t.author_id
     WHERE t.slug = $1
     LIMIT 1`,
    slug,
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export function canViewTemplate(
  template: ProfileTemplateRecord,
  viewer?: { id?: string; isAdmin?: boolean; role?: string } | null,
) {
  if (template.visibility === "PUBLIC" && template.status === "PUBLISHED") return true;
  if (viewer?.id && viewer.id === template.authorId) return true;
  if (viewer?.role === "ADMIN" || viewer?.isAdmin) return true;
  if (template.visibility === "UNLISTED" && template.status === "PUBLISHED") return true;
  return false;
}

export async function createTemplate(input: {
  authorId: string;
  title: string;
  description?: string;
  visibility: TemplateVisibility;
  config: ProfileCustomizationConfig;
  canPublish: boolean;
  isAdmin?: boolean;
}) {
  const title = cleanText(input.title, 60);
  if (title.length < 2) throw new Error("Đặt tên mẫu ít nhất 2 ký tự.");
  const description = cleanText(input.description, 200);
  const parsed = parseProfileCustomization(toShareableTemplate(input.config));
  if (!parsed.success) throw new Error("Cấu hình mẫu không hợp lệ.");

  await ensureProfileTemplatesTable();
  const mine = await prisma.$queryRawUnsafe<Array<{ total: bigint; public_count: bigint }>>(
    `SELECT COUNT(*)::bigint AS total,
            COUNT(*) FILTER (WHERE visibility = 'PUBLIC')::bigint AS public_count
     FROM profile_templates WHERE author_id = $1`,
    input.authorId,
  );
  if (Number(mine[0]?.total || 0) >= MAX_TEMPLATES_PER_USER) {
    throw new Error(`Tối đa ${MAX_TEMPLATES_PER_USER} mẫu mỗi tài khoản.`);
  }
  if (input.visibility === "PUBLIC" && Number(mine[0]?.public_count || 0) >= MAX_PUBLIC_TEMPLATES) {
    throw new Error(`Tối đa ${MAX_PUBLIC_TEMPLATES} mẫu công khai.`);
  }
  if (input.visibility === "PUBLIC" && !input.canPublish && !input.isAdmin) {
    throw new Error("Tài khoản này chưa được chia sẻ mẫu công khai.");
  }

  const visibility = input.visibility;
  const status: TemplateStatus =
    visibility === "PRIVATE"
      ? "DRAFT"
      : visibility === "UNLISTED"
        ? "PUBLISHED"
        : input.isAdmin
          ? "PUBLISHED"
          : "PENDING";

  const id = crypto.randomUUID();
  let slug = slugifyTitle(title);
  for (let i = 0; i < 4; i += 1) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO profile_templates
          (id, slug, author_id, title, description, visibility, status, config, published_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb, $9)`,
        id,
        slug,
        input.authorId,
        title,
        description,
        visibility,
        status,
        JSON.stringify(parsed.data),
        status === "PUBLISHED" ? new Date() : null,
      );
      const created = await getTemplateById(id);
      if (!created) throw new Error("Không lưu được mẫu.");
      return created;
    } catch (error: any) {
      if (String(error?.message || "").includes("profile_templates_slug") || String(error?.code) === "23505") {
        slug = slugifyTitle(title);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Không tạo được đường dẫn mẫu, thử lại.");
}

export async function updateTemplate(
  id: string,
  authorId: string,
  patch: { title?: string; description?: string; visibility?: TemplateVisibility },
  opts: { isAdmin?: boolean; canPublish?: boolean },
) {
  const current = await getTemplateById(id);
  if (!current) throw new Error("Không tìm thấy mẫu.");
  if (current.authorId !== authorId && !opts.isAdmin) throw new Error("Không sửa được mẫu của người khác.");

  const title = patch.title !== undefined ? cleanText(patch.title, 60) : current.title;
  if (title.length < 2) throw new Error("Đặt tên mẫu ít nhất 2 ký tự.");
  const description = patch.description !== undefined ? cleanText(patch.description, 200) : current.description;
  let visibility = patch.visibility || current.visibility;
  if (visibility === "PUBLIC" && !opts.canPublish && !opts.isAdmin) {
    throw new Error("Tài khoản này chưa được chia sẻ mẫu công khai.");
  }

  if (visibility === "PUBLIC") {
    const pub = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*)::bigint AS count FROM profile_templates
       WHERE author_id = $1 AND visibility = 'PUBLIC' AND id <> $2`,
      current.authorId,
      id,
    );
    if (Number(pub[0]?.count || 0) >= MAX_PUBLIC_TEMPLATES) {
      throw new Error(`Tối đa ${MAX_PUBLIC_TEMPLATES} mẫu công khai.`);
    }
  }

  let status = current.status;
  let publishedAt: Date | null = current.publishedAt ? new Date(current.publishedAt) : null;
  if (visibility === "PRIVATE") {
    status = "DRAFT";
    publishedAt = null;
  } else if (visibility === "UNLISTED") {
    status = "PUBLISHED";
    publishedAt = publishedAt || new Date();
  } else if (visibility === "PUBLIC") {
    status = opts.isAdmin ? "PUBLISHED" : "PENDING";
    if (status !== "PUBLISHED") publishedAt = null;
  }

  await prisma.$executeRawUnsafe(
    `UPDATE profile_templates
     SET title = $2, description = $3, visibility = $4, status = $5, published_at = $6, updated_at = NOW()
     WHERE id = $1`,
    id,
    title,
    description,
    visibility,
    status,
    publishedAt,
  );
  return getTemplateById(id);
}

export async function reviewTemplate(id: string, action: "APPROVE" | "REJECT") {
  const current = await getTemplateById(id);
  if (!current) throw new Error("Không tìm thấy mẫu.");
  const status: TemplateStatus = action === "APPROVE" ? "PUBLISHED" : "REJECTED";
  await prisma.$executeRawUnsafe(
    `UPDATE profile_templates
     SET status = $2, published_at = $3, updated_at = NOW()
     WHERE id = $1`,
    id,
    status,
    action === "APPROVE" ? new Date() : null,
  );
  return getTemplateById(id);
}

export async function deleteTemplate(id: string, authorId: string, isAdmin = false) {
  const current = await getTemplateById(id);
  if (!current) throw new Error("Không tìm thấy mẫu.");
  if (current.authorId !== authorId && !isAdmin) throw new Error("Không xóa được mẫu của người khác.");
  await prisma.$executeRawUnsafe(`DELETE FROM profile_template_uses WHERE template_id = $1`, id);
  await prisma.$executeRawUnsafe(`DELETE FROM profile_templates WHERE id = $1`, id);
}

export async function applyTemplate(templateId: string, userId: string, viewer: { id?: string; role?: string; isAdmin?: boolean } | null) {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Không tìm thấy mẫu.");
  if (!canViewTemplate(template, viewer)) throw new Error("Mẫu này chưa công khai.");

  const existing = await prisma.profile_customizations.findUnique({ where: { userId } });
  const current = normalizeProfileCustomization(existing?.draftConfig);
  const next = applyShareableTemplate(current, template.config);

  if (existing) {
    await prisma.profile_customizations.update({
      where: { userId },
      data: { draftConfig: next as any, draftVersion: { increment: 1 } },
    });
  } else {
    await prisma.profile_customizations.create({
      data: {
        userId,
        draftConfig: next as any,
        publishedConfig: DEFAULT_PROFILE_CUSTOMIZATION as any,
      },
    });
  }

  const inserted = await prisma.$queryRawUnsafe<Array<{ template_id: string }>>(
    `INSERT INTO profile_template_uses (template_id, user_id, used_at)
     VALUES ($1,$2,NOW())
     ON CONFLICT (template_id, user_id) DO NOTHING
     RETURNING template_id`,
    templateId,
    userId,
  );
  if (inserted.length) {
    await prisma.$executeRawUnsafe(
      `UPDATE profile_templates SET use_count = use_count + 1, updated_at = NOW() WHERE id = $1`,
      templateId,
    );
  } else {
    await prisma.$executeRawUnsafe(
      `UPDATE profile_template_uses SET used_at = NOW() WHERE template_id = $1 AND user_id = $2`,
      templateId,
      userId,
    );
  }
  return next;
}

export async function canPublishTemplates(user: { role?: string | null; status?: string | null; isAdmin?: boolean | null } | null) {
  return userHasPermission(user, "profile.template_publish");
}

export async function sharePublishedAsUnlisted(input: {
  authorId: string;
  title: string;
  config: ProfileCustomizationConfig;
}) {
  const title = cleanText(input.title, 60) || "Giao diện của tôi";
  const parsed = parseProfileCustomization(toShareableTemplate(input.config));
  if (!parsed.success) throw new Error("Cấu hình mẫu không hợp lệ.");

  await ensureProfileTemplatesTable();
  const existing = await prisma.$queryRawUnsafe<TemplateRow[]>(
    `SELECT t.*, u.name AS author_name, COALESCE(u.image, u.avatar) AS author_avatar
     FROM profile_templates t
     LEFT JOIN users u ON u.id = t.author_id
     WHERE t.author_id = $1 AND t.visibility = 'UNLISTED'
     ORDER BY t.updated_at DESC
     LIMIT 1`,
    input.authorId,
  );
  if (existing[0]) {
    await prisma.$executeRawUnsafe(
      `UPDATE profile_templates
       SET title = $2, config = $3::jsonb, status = 'PUBLISHED',
           published_at = COALESCE(published_at, NOW()), updated_at = NOW()
       WHERE id = $1`,
      existing[0].id,
      title,
      JSON.stringify(parsed.data),
    );
    const updated = await getTemplateById(existing[0].id);
    if (!updated) throw new Error("Không lưu được mẫu.");
    return updated;
  }
  return createTemplate({
    authorId: input.authorId,
    title,
    visibility: "UNLISTED",
    config: parsed.data,
    canPublish: true,
  });
}
