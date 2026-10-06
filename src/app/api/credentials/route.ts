import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUBJECTS = ["INDIVIDUAL", "ORGANIZATION"] as const;
const KINDS = ["DEGREE", "CERTIFICATE", "BUSINESS_LICENSE", "TAX_REGISTRATION"] as const;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  const rows = await prisma.credentials.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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
      status: row.status,
      rejectedReason: row.rejectedReason,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Bạn cần đăng nhập" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const subjectType = SUBJECTS.includes(body?.subjectType) ? body.subjectType : null;
  const kind = KINDS.includes(body?.kind) ? body.kind : null;
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 160) : "";
  const issuer = typeof body?.issuer === "string" ? body.issuer.trim().slice(0, 160) : "";
  const fileUrl = typeof body?.fileUrl === "string" ? body.fileUrl.trim().slice(0, 500) : "";
  const credentialCode = typeof body?.credentialCode === "string" ? body.credentialCode.trim().slice(0, 80) : "";
  const issuedAt = typeof body?.issuedAt === "string" && body.issuedAt ? new Date(body.issuedAt) : null;
  if (!subjectType || !kind || !title || !issuer || !/^https:\/\//i.test(fileUrl)) {
    return NextResponse.json({ error: "Thiếu tên, đơn vị cấp hoặc ảnh https" }, { status: 400 });
  }
  if (issuedAt && Number.isNaN(issuedAt.getTime())) {
    return NextResponse.json({ error: "Ngày cấp không hợp lệ" }, { status: 400 });
  }
  const pending = await prisma.credentials.count({ where: { userId, status: "PENDING" } });
  if (pending >= 10) return NextResponse.json({ error: "Đang có quá nhiều hồ sơ chờ duyệt" }, { status: 400 });
  const row = await prisma.credentials.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      subjectType,
      kind,
      title,
      issuer,
      issuedAt,
      credentialCode: credentialCode || null,
      fileUrl,
      updatedAt: new Date(),
    },
  });
  return NextResponse.json({ id: row.id, status: row.status }, { status: 201 });
}
