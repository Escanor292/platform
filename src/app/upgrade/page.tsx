import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UpgradeHubPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/upgrade");
  }

  const sessionUser = session.user as {
    id?: string;
    email?: string | null;
    role?: string;
    isOrganization?: boolean;
  };

  const dbUser = sessionUser.id
    ? await prisma.users.findUnique({
        where: { id: sessionUser.id },
        select: { role: true, isOrganization: true },
      })
    : sessionUser.email
      ? await prisma.users.findUnique({
          where: { email: sessionUser.email },
          select: { role: true, isOrganization: true },
        })
      : null;

  const role = dbUser?.role || sessionUser.role || "BACKER";
  if (role === "CREATOR" || role === "ADMIN") {
    redirect("/dashboard/creator");
  }

  const isOrg = dbUser?.isOrganization ?? Boolean(sessionUser.isOrganization);
  redirect(isOrg ? "/upgrade/organization" : "/upgrade/individual");
}
