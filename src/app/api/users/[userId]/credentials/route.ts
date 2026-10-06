import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  const rows = await prisma.credentials.findMany({
    where: { userId, status: "VERIFIED" },
    orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      subjectType: true,
      kind: true,
      title: true,
      issuer: true,
      issuedAt: true,
      credentialCode: true,
      fileUrl: true,
    },
  });
  return NextResponse.json({ credentials: rows });
}
