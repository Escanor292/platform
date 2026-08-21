import prisma from "@/lib/prisma";
import { buildExtractiveSummary } from "./extractive";
import { cleanText, extractKeywords, flattenRichContent, safeString, truncateText } from "./text";
import type { SummaryDocument, SummaryMetric, SummaryResult, SummarySourceType } from "./types";

function numberText(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Chưa cập nhật";
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat("vi-VN").format(number) : String(value);
}

function dateText(value: unknown): string {
  if (!value) return "Chưa cập nhật";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Chưa cập nhật" : date.toLocaleDateString("vi-VN");
}

function createDocument(
  sourceType: SummarySourceType,
  sourceId: string,
  title: string,
  facts: string[],
  textParts: unknown[],
  metrics: SummaryMetric[],
): SummaryDocument {
  const text = truncateText(
    [...facts, ...textParts.map(cleanText).filter(Boolean)].join("\n"),
    14000,
  );
  return {
    sourceType,
    sourceId,
    title: safeString(title, "Nội dung chưa đặt tên"),
    text,
    facts: facts.map(cleanText).filter(Boolean),
    metrics,
    keywords: extractKeywords(`${title} ${text}`),
  };
}

async function loadProfile(sourceId: string): Promise<SummaryDocument> {
  const user = await prisma.users.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      name: true,
      displayName: true,
      bio: true,
      location: true,
      website: true,
      role: true,
      status: true,
      createdAt: true,
      campaigns: {
        where: { status: { in: ["ACTIVE", "SUCCESS"] } },
        select: { id: true, title: true, category: true, status: true, currentAmount: true, goalAmount: true },
      },
      projects: { select: { id: true, title: true, description: true } },
      blog_posts: {
        where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null },
        select: { id: true, title: true, excerpt: true, viewCount: true, likeCount: true },
        take: 12,
        orderBy: { publishedAt: "desc" },
      },
      _count: { select: { campaigns: true, pledges: true, projects: true, blog_posts: true } },
    },
  });
  if (!user) throw new Error("Không tìm thấy trang cá nhân.");

  const facts = [
    `Tên: ${safeString(user.displayName || user.name)}`,
    user.bio ? `Giới thiệu: ${user.bio}` : "",
    user.location ? `Khu vực: ${user.location}` : "",
    `Vai trò: ${user.role}; trạng thái: ${user.status}`,
    `Tham gia từ: ${dateText(user.createdAt)}`,
    `Có ${user._count.projects} dự án, ${user._count.campaigns} chiến dịch, ${user._count.blog_posts} bài viết công khai và ${user._count.pledges} lượt ủng hộ.`,
  ];
  const metrics = [
    { label: "Dự án", value: numberText(user._count.projects) },
    { label: "Chiến dịch", value: numberText(user._count.campaigns) },
    { label: "Bài viết công khai", value: numberText(user._count.blog_posts) },
    { label: "Lượt ủng hộ", value: numberText(user._count.pledges) },
  ];
  return createDocument("profile", sourceId, safeString(user.displayName || user.name), facts, [
    user.website ? `Website: ${user.website}` : "",
    user.campaigns.map((campaign: any) => `${campaign.title} ${campaign.category} ${campaign.status}`),
    user.projects.map((project: any) => `${project.title} ${project.description || ""}`),
    user.blog_posts.map((post: any) => `${post.title} ${post.excerpt || ""}`),
  ], metrics);
}

async function loadProduct(sourceId: string): Promise<SummaryDocument> {
  const product = await prisma.rewards.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      title: true,
      description: true,
      minAmount: true,
      maxAmount: true,
      stock: true,
      maxQuantity: true,
      deliveryDate: true,
      isActive: true,
      createdAt: true,
      campaigns: { select: { title: true, slug: true, status: true, category: true } },
      projects: { select: { title: true, description: true } },
    },
  });
  if (!product) throw new Error("Không tìm thấy sản phẩm.");

  const facts = [
    `Tên sản phẩm: ${product.title}`,
    product.description ? `Mô tả: ${product.description}` : "",
    `Mức giá/đóng góp: ${numberText(product.minAmount)}${product.maxAmount ? ` - ${numberText(product.maxAmount)}` : ""}`,
    `Trạng thái: ${product.isActive ? "đang hoạt động" : "tạm dừng"}`,
    product.stock !== null ? `Tồn kho: ${numberText(product.stock)}` : "Tồn kho: không giới hạn hoặc chưa cập nhật",
    product.deliveryDate ? `Dự kiến giao: ${dateText(product.deliveryDate)}` : "",
  ];
  const metrics = [
    { label: "Giá tối thiểu", value: numberText(product.minAmount) },
    ...(product.maxAmount ? [{ label: "Giá tối đa", value: numberText(product.maxAmount) }] : []),
    ...(product.stock !== null ? [{ label: "Tồn kho", value: numberText(product.stock) }] : []),
  ];
  return createDocument("product", sourceId, product.title, facts, [
    product.campaigns ? `Chiến dịch liên quan: ${product.campaigns.title} ${product.campaigns.category} ${product.campaigns.status}` : "",
    product.projects ? `Dự án liên quan: ${product.projects.title} ${product.projects.description || ""}` : "",
  ], metrics);
}

async function loadBlog(sourceId: string): Promise<SummaryDocument> {
  const post = await (prisma.blog_posts.findFirst as any)({
    where: { OR: [{ id: sourceId }, { slug: sourceId }] },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      viewCount: true,
      likeCount: true,
      commentCount: true,
      blog_post_tags: { select: { blog_tags: { select: { name: true } } } },
      campaigns: { select: { title: true, category: true } },
      projects: { select: { title: true, description: true } },
    },
  }) as any;
  if (!post) throw new Error("Không tìm thấy bài viết.");

  const richText = "";
  const facts = [
    `Tiêu đề: ${post.title}`,
    post.excerpt ? `Tóm tắt gốc: ${post.excerpt}` : "",
    `Đăng ngày: ${dateText(post.publishedAt)}`,
    `Tương tác: ${numberText(post.viewCount)} lượt xem, ${numberText(post.likeCount)} lượt thích, ${numberText(post.commentCount)} bình luận.`,
    post.campaigns ? `Gắn với chiến dịch: ${post.campaigns.title} (${post.campaigns.category})` : "",
    post.projects ? `Gắn với dự án: ${post.projects.title}` : "",
    `Tags: ${post.blog_post_tags.map((item: any) => item.blog_tags.name).join(", ")}`,
  ];
  return createDocument("blog", post.id, post.title, facts, [post.content, richText, post.excerpt], [
    { label: "Lượt xem", value: numberText(post.viewCount) },
    { label: "Lượt thích", value: numberText(post.likeCount) },
    { label: "Bình luận", value: numberText(post.commentCount) },
  ]);
}

async function loadProject(sourceId: string): Promise<SummaryDocument> {
  const project = await prisma.projects.findUnique({
    where: { id: sourceId },
    select: {
      id: true,
      title: true,
      description: true,
      richDescription: true,
      createdAt: true,
      campaigns: {
        select: { id: true, title: true, status: true, category: true, currentAmount: true, goalAmount: true },
      },
      rewards: { select: { id: true, title: true, description: true, minAmount: true, isActive: true } },
      blog_posts: { select: { id: true, title: true, excerpt: true, status: true } },
    },
  });
  if (!project) throw new Error("Không tìm thấy dự án.");

  const raised = project.campaigns.reduce((sum: number, campaign: any) => sum + Number(campaign.currentAmount), 0);
  const goal = project.campaigns.reduce((sum: number, campaign: any) => sum + Number(campaign.goalAmount), 0);
  const facts = [
    `Tên dự án: ${project.title}`,
    project.description ? `Mô tả: ${project.description}` : "",
    `Tạo ngày: ${dateText(project.createdAt)}`,
    `Có ${project.campaigns.length} chiến dịch, ${project.rewards.length} sản phẩm/phần quà và ${project.blog_posts.length} bài viết liên quan.`,
    `Tổng tiến độ tài chính hiện tại: ${numberText(raised)} trên mục tiêu ${numberText(goal)}.`,
  ];
  return createDocument("project", sourceId, project.title, facts, [
    flattenRichContent(project.richDescription),
    project.campaigns.map((campaign: any) => `${campaign.title} ${campaign.status}`),
    project.rewards.map((reward: any) => `${reward.title} ${reward.description || ""}`),
    project.blog_posts.map((post: any) => `${post.title} ${post.excerpt || ""} ${post.status}`),
  ], [
    { label: "Chiến dịch", value: numberText(project.campaigns.length) },
    { label: "Sản phẩm/phần quà", value: numberText(project.rewards.length) },
    { label: "Bài viết", value: numberText(project.blog_posts.length) },
    { label: "Đã huy động", value: numberText(raised) },
    { label: "Mục tiêu", value: numberText(goal) },
  ]);
}

async function loadCampaign(sourceId: string): Promise<SummaryDocument> {
  const campaign = await prisma.campaigns.findFirst({
    where: { OR: [{ id: sourceId }, { slug: sourceId }] },
    select: {
      id: true,
      title: true,
      description: true,
      longDescription: true,
      category: true,
      tags: true,
      type: true,
      status: true,
      goalAmount: true,
      currentAmount: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      users: { select: { name: true, status: true } },
      rewards: { select: { title: true, description: true, minAmount: true } },
      campaign_updates: { select: { title: true, content: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 },
      blog_posts: { select: { title: true, excerpt: true, status: true }, take: 8, orderBy: { publishedAt: "desc" } },
      _count: { select: { pledges: true, campaign_followers: true } },
    },
  });
  if (!campaign) throw new Error("Không tìm thấy chiến dịch.");

  const current = Number(campaign.currentAmount);
  const goal = Number(campaign.goalAmount);
  const percent = goal > 0 ? Math.round((current / goal) * 100) : 0;
  const facts = [
    `Tên chiến dịch: ${campaign.title}`,
    `Mô tả: ${campaign.description}`,
    campaign.longDescription ? `Mô tả chi tiết: ${campaign.longDescription}` : "",
    `Danh mục: ${campaign.category}; loại: ${campaign.type}; trạng thái: ${campaign.status}`,
    `Người tạo: ${campaign.users.name}; trạng thái tài khoản: ${campaign.users.status}`,
    `Thời gian: ${dateText(campaign.startDate)} đến ${dateText(campaign.endDate)}`,
    `Tiến độ: ${numberText(current)} trên ${numberText(goal)} (${percent}%).`,
    `Cộng đồng: ${numberText(campaign._count.pledges)} lượt ủng hộ và ${numberText(campaign._count.campaign_followers)} người theo dõi.`,
    `Tags: ${campaign.tags.join(", ")}`,
  ];
  return createDocument("campaign", campaign.id, campaign.title, facts, [
    campaign.rewards.map((reward: any) => `${reward.title} ${reward.description || ""} ${numberText(reward.minAmount)}`),
    campaign.campaign_updates.map((update: any) => `${update.title} ${update.content}`),
    campaign.blog_posts.map((post: any) => `${post.title} ${post.excerpt || ""} ${post.status}`),
  ], [
    { label: "Tiến độ", value: `${percent}%` },
    { label: "Đã huy động", value: numberText(current) },
    { label: "Mục tiêu", value: numberText(goal) },
    { label: "Lượt ủng hộ", value: numberText(campaign._count.pledges) },
    { label: "Người theo dõi", value: numberText(campaign._count.campaign_followers) },
  ]);
}

export async function loadSummaryDocument(sourceType: SummarySourceType, sourceId: string): Promise<SummaryDocument> {
  switch (sourceType) {
    case "profile": return loadProfile(sourceId);
    case "product": return loadProduct(sourceId);
    case "blog": return loadBlog(sourceId);
    case "project": return loadProject(sourceId);
    case "campaign": return loadCampaign(sourceId);
  }
}

export function buildFallbackSummary(document: SummaryDocument): SummaryResult {
  return buildExtractiveSummary(document);
}
