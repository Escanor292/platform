import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getProjectOwnerStats } from "@/lib/owner-revenue";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.projects.findUnique({
    where: { id },
    select: { creatorId: true },
  });
  if (!project || project.creatorId !== userId) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  const stats = await getProjectOwnerStats(id);
  return NextResponse.json(stats, { headers: { "Cache-Control": "no-store" } });
}
