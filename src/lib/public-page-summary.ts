export type PublicEntityType = "campaign" | "product" | "blog" | "project" | "profile";

export type PublicPageContext = {
  type: PublicEntityType;
  id: string;
};

export type SupplementalPublicData = {
  updates?: unknown[];
  reviews?: unknown[];
  comments?: unknown[];
};

const summaryWords = /(tóm tắt|tổng hợp|tóm lược|tình hình|thông tin.*trang|trang.*có gì|toàn bộ thông tin)/iu;

export function isPublicPageSummaryQuestion(question: string) {
  return summaryWords.test(question.trim());
}

export function publicPageContextFromPath(pathname: string): PublicPageContext | null {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  const patterns: Array<[PublicEntityType, RegExp]> = [
    ["campaign", /^\/campaigns\/([^/]+)$/u],
    ["product", /^\/products\/([^/]+)$/u],
    ["blog", /^\/blog\/(?:posts\/)?([^/]+)$/u],
    ["project", /^\/projects\/([^/]+)$/u],
    ["profile", /^\/(?:profile|users)\/([^/]+)$/u],
  ];
  for (const [type, pattern] of patterns) {
    const match = pattern.exec(cleanPath);
    if (match && match[1] && !["create", "new", "edit", "settings", "me"].includes(match[1])) {
      return { type, id: decodeURIComponent(match[1]) };
    }
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function countList(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function statusLabel(value: unknown) {
  const status = typeof value === "string" ? value : "đang hiển thị công khai";
  return status.toLocaleLowerCase("vi-VN");
}

function summarizeCampaign(data: Record<string, unknown>, extra: SupplementalPublicData) {
  const updates = countList(extra.updates);
  const reviews = countList(extra.reviews);
  const counts = asRecord(data._count);
  const rewards = countList(data.rewards);
  const goal = numberValue(data.goalAmount);
  const raised = numberValue(data.currentAmount);
  const progress = goal && raised !== null ? ` Đã đạt ${Math.round((raised / goal) * 100)}% mục tiêu.` : "";
  return `Đây là chiến dịch “${String(data.title ?? "chưa có tiêu đề")}”, hiện ${statusLabel(data.status)}. Mục tiêu là ${goal !== null ? goal.toLocaleString("vi-VN") : "chưa công bố"} và đã huy động ${raised !== null ? raised.toLocaleString("vi-VN") : "chưa có số liệu"}.${progress} Có ${numberValue(counts.pledges) ?? 0} lượt ủng hộ, ${rewards} phần thưởng và ${numberValue(counts.campaign_followers) ?? 0} người theo dõi. Trang có ${updates} cập nhật và ${reviews} phản hồi công khai trong dữ liệu hiện có. ${String(data.description ?? data.longDescription ?? "Bạn có thể xem phần mô tả để biết thêm bối cảnh.")}`;
}

function summarizeProduct(data: Record<string, unknown>, extra: SupplementalPublicData) {
  const campaigns = asRecord(data.campaigns);
  const reviews = extra.reviews ?? [];
  const rating = numberValue(data.averageRating);
  const reviewCount = numberValue(data.reviewCount) ?? countList(reviews);
  const soldCount = numberValue(data.soldCount);
  return `Đây là sản phẩm “${String(data.title ?? "chưa có tên")}"${data.description ? `: ${String(data.description)}` : "."} Giá từ ${numberValue(data.minAmount) !== null ? numberValue(data.minAmount)!.toLocaleString("vi-VN") : "chưa công bố"}. ${rating !== null ? `Điểm đánh giá trung bình ${rating.toFixed(1)}/5 từ ${reviewCount} đánh giá` : `Hiện có ${reviewCount} đánh giá công khai`}${soldCount !== null ? ` và ${soldCount} lượt ủng hộ/mua thành công` : ""}. ${campaigns.title ? `Sản phẩm thuộc chiến dịch “${String(campaigns.title)}”.` : ""}`;
}

function summarizeBlog(data: Record<string, unknown>, extra: SupplementalPublicData) {
  const comments = numberValue(data.commentCount) ?? countList(extra.comments);
  return `Bài viết “${String(data.title ?? "chưa có tiêu đề")}" được đăng ${data.publishedAt ? `vào ${new Date(String(data.publishedAt)).toLocaleDateString("vi-VN")}` : "trên Blog công khai"}. ${String(data.excerpt ?? "")}`.trim() + ` Bài viết hiện có ${numberValue(data.viewCount) ?? 0} lượt xem, ${numberValue(data.likeCount) ?? 0} lượt thích và ${comments} bình luận. Có thể đọc toàn bộ nội dung ngay trên trang.`;
}

function summarizeProject(data: Record<string, unknown>) {
  const counts = asRecord(data._count);
  return `Đây là dự án “${String(data.title ?? "chưa có tiêu đề")}". ${String(data.description ?? "Dự án chưa có phần mô tả công khai.")} Dữ liệu công khai hiện ghi nhận ${numberValue(counts.campaigns) ?? 0} chiến dịch, ${numberValue(counts.blog_posts) ?? 0} bài viết và ${numberValue(counts.rewards) ?? 0} sản phẩm liên quan.`;
}

function summarizeProfile(data: Record<string, unknown>) {
  const stats = asRecord(data.publicStats);
  return `Đây là trang của ${String(data.displayName ?? data.name ?? "người dùng này")}. ${String(data.bio ?? "Chưa có phần giới thiệu công khai.")} Hồ sơ hiện có ${numberValue(stats.campaignCount) ?? 0} chiến dịch, tổng số tiền huy động công khai ${numberValue(stats.totalRaised)?.toLocaleString("vi-VN") ?? "chưa có số liệu"} và ${numberValue(stats.totalBackers) ?? 0} lượt ủng hộ.`;
}

export function summarizePublicPage(type: PublicEntityType, rawData: unknown, extra: SupplementalPublicData = {}) {
  const data = asRecord(rawData);
  switch (type) {
    case "campaign": return summarizeCampaign(data, extra);
    case "product": return summarizeProduct(data, extra);
    case "blog": return summarizeBlog(data, extra);
    case "project": return summarizeProject(data);
    case "profile": return summarizeProfile(data);
  }
}

export function publicSummaryEndpoint(context: PublicPageContext) {
  return `/api/public/entities/${encodeURIComponent(context.type)}/${encodeURIComponent(context.id)}`;
}

export function supplementalSummaryEndpoints(context: PublicPageContext) {
  if (context.type === "campaign") return {
    updates: `/api/campaigns/${encodeURIComponent(context.id)}/updates`,
    reviews: `/api/campaigns/${encodeURIComponent(context.id)}/reviews`,
  };
  if (context.type === "blog") return { comments: `/api/blog/posts/${encodeURIComponent(context.id)}/comments` };
  if (context.type === "product") return { reviews: `/api/products/${encodeURIComponent(context.id)}/reviews` };
  return {};
}

export function isSafePublicSummaryPayload(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value);
}
