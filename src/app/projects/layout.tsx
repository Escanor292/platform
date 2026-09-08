import { buildSocialMetadata } from "@/lib/seo";

export const metadata = buildSocialMetadata({
  title: "Khám phá",
  description: "Tìm chiến dịch, dự án và sản phẩm đang gây quỹ trên Tử Tế Fund.",
  path: "/projects",
});

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
