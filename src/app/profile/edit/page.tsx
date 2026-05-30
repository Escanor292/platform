import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ProfileEditRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Lấy user từ database để có ID
  const dbUser = await prisma.users.findUnique({
    where: { email: session.user.email! },
    select: { id: true }
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  // Redirect đến trang edit của user
  redirect(`/profile/${dbUser.id}/edit`);
}
