export type CatalogHit = {
  type: "project" | "campaign" | "blog" | "product" | "profile";
  title: string;
  href: string;
  excerpt?: string;
};

export function catalogQueryFromQuestion(question: string) {
  return question
    .replace(/^(?:tìm|tìm kiếm|search|hãy tìm|cho tôi xem|liệt kê|có|những)/giu, "")
    .replace(/(?:dự án|project|blog|bài viết|chiến dịch|campaign|sản phẩm|product|hồ sơ|người dùng)/giu, "")
    .replace(/[?!.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function formatCatalogAnswer(query: string, hits: CatalogHit[]) {
  if (!hits.length) {
    return `Mình chưa thấy dự án, blog, chiến dịch hay sản phẩm công khai khớp “${query}”. Bạn thử từ khóa khác nhé.`;
  }
  const lines = hits.slice(0, 8).map(hit => {
    const label = hit.type === "project" ? "Dự án" : hit.type === "campaign" ? "Chiến dịch" : hit.type === "blog" ? "Blog" : hit.type === "product" ? "Sản phẩm" : "Hồ sơ";
    return `- ${label}: ${hit.title}${hit.excerpt ? ` — ${hit.excerpt}` : ""}`;
  });
  return `Mình tìm thấy các nội dung công khai liên quan “${query}”:\n${lines.join("\n")}`;
}
