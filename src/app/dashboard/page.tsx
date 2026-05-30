import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user as any;

  // Lấy user từ database để đảm bảo có ID
  const dbUser = await prisma.users.findUnique({
    where: { email: user.email },
    select: { id: true }
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  // Redirect đến trang profile của chính user
  redirect(`/profile/${dbUser.id}`);
}
