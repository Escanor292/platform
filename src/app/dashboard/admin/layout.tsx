import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, Users, BarChart3, ShieldCheck, DollarSign, Award } from "lucide-react";
import AdminUserMenu from "@/components/admin/AdminUserMenu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { href: "/dashboard/admin", label: "Tổng quan", icon: Home },
    { href: "/dashboard/admin/users", label: "Người dùng", icon: Users },
    { href: "/dashboard/admin/campaigns", label: "Chiến dịch", icon: ShieldCheck },
    { href: "/dashboard/admin/badges", label: "Huy hiệu", icon: Award },
    { href: "/dashboard/admin/revenue", label: "Doanh thu", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-8">
              <Link href="/dashboard/admin" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">Admin Panel</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Control Center</div>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <AdminUserMenu user={session.user} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
