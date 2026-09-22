import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SoApp } from "@/components/so/SoApp";

export const metadata: Metadata = {
  title: "Tử Tế Sổ",
  robots: { index: false, follow: false },
};

export default async function SoPage() {
  const session = await auth();
  const user = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  if (!user) redirect("/auth/login?callbackUrl=/so");
  if (user.role !== "ADMIN" && !user.isAdmin) redirect("/");
  return <SoApp />;
}
