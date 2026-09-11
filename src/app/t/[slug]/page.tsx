import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { canViewTemplate, getTemplateBySlug } from "@/lib/profile-templates";
import { userHasPermission } from "@/lib/permissions";
import { buildSocialMetadata } from "@/lib/seo";
import ProfileStudioPreview from "@/components/profile/ProfileStudioPreview";
import { ApplySharedTemplateButton } from "@/components/profile/ApplySharedTemplateButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) return { title: "Mẫu giao diện" };
  const shareable =
    template.visibility === "PRIVATE" ||
    (template.status === "PUBLISHED" && (template.visibility === "PUBLIC" || template.visibility === "UNLISTED"));
  if (!shareable) return { title: "Mẫu giao diện" };
  return buildSocialMetadata({
    title: template.title,
    description: template.description || "Mẫu giao diện trang cá nhân trên Tử Tế Fund.",
    path: `/t/${slug}`,
  });
}

export default async function SharedTemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const template = await getTemplateBySlug(slug);
  if (!template || !canViewTemplate(template, session?.user as any)) notFound();
  const canApply = Boolean(session?.user) && (await userHasPermission(session?.user as any, "profile.customize"));

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-white to-white px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-pgreen">Mẫu giao diện</div>
          <h1 className="font-display text-4xl font-black text-dblue">{template.title}</h1>
          <p className="mt-3 max-w-xl text-gray-600">{template.description || "Chỉ gồm màu sắc và bố cục. Nội dung hồ sơ của bạn được giữ nguyên."}</p>
          <p className="mt-2 text-sm text-gray-400">Tạo bởi {template.authorName || "thành viên"} · {template.useCount} lượt dùng</p>
          <div className="mt-4 flex gap-2">
            {template.config.theme.gradientColors.map((color, index) => (
              <span key={`${color}-${index}`} className="h-8 w-8 rounded-full border border-white shadow" style={{ background: color }} />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {canApply ? (
              <ApplySharedTemplateButton templateId={template.id} />
            ) : session?.user ? (
              <p className="rounded-xl bg-cream px-4 py-3 text-sm text-gray-600">Tài khoản Creator mới dùng được mẫu này trong Profile Studio.</p>
            ) : (
              <Link href={`/auth/login?callbackUrl=/t/${slug}`} className="rounded-xl bg-pgreen px-4 py-3 text-sm font-black text-white">
                Đăng nhập để dùng mẫu
              </Link>
            )}
            <Link href="/" className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
              Về trang chủ
            </Link>
          </div>
        </div>
        <ProfileStudioPreview config={template.config} mode="desktop" />
      </div>
    </main>
  );
}
