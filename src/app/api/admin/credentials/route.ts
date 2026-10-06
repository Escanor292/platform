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
  const rows = await prisma.credentials.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { users: { select: { id: true, name: true, displayName: true, isOrganization: true } } },
  });
  return NextResponse.json({
    credentials: rows.map((row) => ({
      id: row.id,
      subjectType: row.subjectType,
      kind: row.kind,
      title: row.title,
      issuer: row.issuer,
      issuedAt: row.issuedAt,
      credentialCode: row.credentialCode,
      fileUrl: row.fileUrl,
      createdAt: row.createdAt,
      ownerId: row.users.id,
      ownerName: row.users.displayName || row.users.name,
      isOrganization: row.users.isOrganization,
    })),
  });
}
