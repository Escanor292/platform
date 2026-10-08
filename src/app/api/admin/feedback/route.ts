import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(user: { role?: string; isAdmin?: boolean } | undefined) {
  return !!user && (user.role === "ADMIN" || user.isAdmin === true);
}

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string; isAdmin?: boolean } | undefined;
  if (!isAdmin(user)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  const rows = await prisma.platform_feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { users: { select: { id: true, name: true, displayName: true, email: true } } },
  });
  return NextResponse.json({
    feedback: rows.map((row) => ({
      id: row.id,
      category: row.category,
      message: row.message,
      pageUrl: row.pageUrl,
      status: row.status,
      createdAt: row.createdAt,
      userId: row.users.id,
      userName: row.users.displayName || row.users.name,
      email: row.users.email,
    })),
  });
}
