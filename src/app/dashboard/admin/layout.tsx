import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import AdminUserMenu from "@/components/admin/AdminUserMenu";
import AdminNav from "@/components/admin/AdminNav";
import { isPresentationActive } from "@/lib/admin-presentation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) {
    redirect("/");
  }

  const showPresentation = await isPresentationActive();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-lg md:top-0">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          <div className="flex min-h-14 flex-col gap-2 py-2 md:min-h-16 md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Link href="/dashboard/admin" className="flex shrink-0 items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 md:h-10 md:w-10">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">Admin Panel</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tử Tế Fund</div>
                </div>
              </Link>
              <div className="md:hidden">
                <AdminUserMenu user={session.user} />
              </div>
            </div>
            <AdminNav showPresentation={showPresentation} />
            <div className="hidden md:block">
              <AdminUserMenu user={session.user} />
            </div>
          </div>
        </div>
      </nav>
      <main className="pb-8">{children}</main>
    </div>
  );
}
