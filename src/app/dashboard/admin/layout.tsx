import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-6">
              <Link href="/dashboard/admin" className="flex shrink-0 items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">Admin Panel</div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Tử Tế Fund</div>
                </div>
              </Link>
              <AdminNav />
            </div>
            <AdminUserMenu user={session.user} />
          </div>
        </div>
      </nav>
      <main className="pt-20">{children}</main>
    </div>
  );
}
