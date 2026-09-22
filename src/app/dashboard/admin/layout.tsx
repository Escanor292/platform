import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminUserMenu from "@/components/admin/AdminUserMenu";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-lg md:top-0">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          <div className="flex min-h-14 flex-col gap-2 py-2 md:min-h-16 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
            <div className="flex items-center justify-end gap-2 md:hidden">
              <Link href="/so" className="inline-flex h-10 items-center rounded-xl bg-pgreen px-3 text-sm font-bold text-white">
                Mở Sổ
              </Link>
              <AdminUserMenu user={session.user} />
            </div>
            <AdminNav />
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/so" className="inline-flex h-10 items-center rounded-xl bg-pgreen px-3 text-sm font-bold text-white">
                Mở Tử Tế Sổ
              </Link>
              <AdminUserMenu user={session.user} />
            </div>
          </div>
        </div>
      </nav>
      <main className="pb-8">{children}</main>
    </div>
  );
}
