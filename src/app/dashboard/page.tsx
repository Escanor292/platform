import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;

  // 1. Nếu là Admin -> Chuyển hướng Dashboard Admin
  if (user.role === "ADMIN" || user.isAdmin === true) {
    redirect("/dashboard/admin");
  }

  // 2. Nếu là Creator (hoặc PRO) -> Chuyển hướng Dashboard Creator
  if (user.role === "CREATOR" || user.role === "CREATOR_PRO" || user.isPro === true) {
    redirect("/dashboard/creator");
  }

  // 3. Mặc định (Backer) -> Chuyển hướng Dashboard Backer
  redirect("/dashboard/backer");
}
