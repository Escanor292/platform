import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORIES = ["BUG", "IDEA", "OTHER"] as const;

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập để gửi góp ý" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const category = CATEGORIES.includes(body?.category) ? body.category : "IDEA";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";
  const pageUrl = typeof body?.pageUrl === "string" ? body.pageUrl.trim().slice(0, 300) : "";
  if (message.length < 10) {
    return NextResponse.json({ error: "Góp ý cần ít nhất 10 ký tự" }, { status: 400 });
  }
  if (pageUrl && !pageUrl.startsWith("/")) {
    return NextResponse.json({ error: "Trang liên quan phải là đường dẫn trong nền tảng" }, { status: 400 });
  }

  const recent = await prisma.platform_feedback.count({
    where: { userId, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  if (recent >= 3) {
    return NextResponse.json({ error: "Bạn vừa gửi góp ý. Hãy chờ một lát rồi gửi tiếp." }, { status: 429 });
  }

  const row = await prisma.platform_feedback.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      category,
      message,
      pageUrl: pageUrl || null,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({ id: row.id }, { status: 201 });
}
