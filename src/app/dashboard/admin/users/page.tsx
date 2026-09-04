import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Shield, Star, User } from "lucide-react";
import UserStatusToggle from "@/components/admin/UserStatusToggle";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user || ((session.user as any).role !== "ADMIN" && !(session.user as any).isAdmin)) redirect("/");

  const { q } = await searchParams;
  const query = (q || "").trim();

  const users = await prisma.users.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          campaigns: true,
          pledges: true
        }
      }
    }
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN": return Shield;
      case "CREATOR": return Star;
      case "CREATOR_PRO": return Star;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-600";
      case "CREATOR": return "bg-blue-100 text-blue-600";
      case "CREATOR_PRO": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-400 font-medium">{query ? `Kết quả cho “${query}” · ${users.length} người` : `Tổng cộng ${users.length} người dùng`}</p>
          </div>
        </div>

        <form action="/dashboard/admin/users" className="flex gap-3">
          <input name="q" defaultValue={query} placeholder="Tìm theo tên hoặc email" className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none" />
          <button className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white">Tìm</button>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Tổng số</div>
            <div className="text-3xl font-black text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Admin</div>
            <div className="text-3xl font-black text-red-600">
              {users.filter(u => u.role === "ADMIN").length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Creator</div>
            <div className="text-3xl font-black text-blue-600">
              {users.filter(u => u.role === "CREATOR").length}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {users.filter(u => u.role === "CREATOR" && u.status === "PRO").length} Pro
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="text-sm text-gray-400 font-bold mb-1">Backer</div>
            <div className="text-3xl font-black text-gray-600">
              {users.filter(u => u.role === "BACKER").length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Chiến dịch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Đóng góp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                    Ngày tham gia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div className="font-bold text-gray-900 hover:text-blue-700">
                            {user.name || "Chưa đặt tên"}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${getRoleColor(user.role)}`}>
                          <RoleIcon size={12} />
                          {user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserStatusToggle
                          userId={user.id}
                          userName={user.name || user.email}
                          userRole={user.role}
                          status={user.status}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {user._count.campaigns}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {user._count.pledges}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
