import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settlePledgeAsPaid } from "@/lib/payment/settle-pledge";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const role = (session?.user as { role?: string; isAdmin?: boolean; id?: string } | undefined);
  if (!session?.user || (role?.role !== "ADMIN" && !role?.isAdmin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const result = await settlePledgeAsPaid(id, {
    userId: role?.id || null,
    reason: "Admin đối soát tiền vào tài khoản ngân hàng trung gian",
  });

  if (!result.ok) {
    return NextResponse.json({ error: "Không đối soát được lệnh này", reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ ok: true, docs: result.docs });
}
