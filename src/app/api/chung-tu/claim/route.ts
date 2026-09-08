import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claimCertificateByCode } from "@/lib/tax/certificate";

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Cần đăng nhập để lưu chứng từ vào Kho đồ" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  if (!code) return NextResponse.json({ error: "Thiếu mã chứng từ" }, { status: 400 });

  const result = await claimCertificateByCode(code, {
    id: userId,
    email: session?.user?.email,
  });

  if (!result.ok) {
    const status = result.reason === "forbidden" ? 403 : 404;
    return NextResponse.json(
      { error: result.reason === "forbidden" ? "Email không khớp chứng từ này" : "Không tìm thấy chứng từ" },
      { status },
    );
  }

  return NextResponse.json({
    ok: true,
    code: result.certificate.code,
    pledgeId: result.certificate.pledgeId,
  });
}
