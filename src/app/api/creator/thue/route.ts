import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { creatorTaxReport, toCsv } from "@/lib/tax/ledger";

export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const year = Number(request.nextUrl.searchParams.get("year") || new Date().getFullYear());
  const report = await creatorTaxReport(userId, Number.isFinite(year) ? year : new Date().getFullYear());
  const csv = toCsv(report.rows.map((row) => ({
    ngay: row.createdAt,
    chien_dich: row.campaignTitle,
    hang: row.rewardTitle,
    loai_khoan: row.flow,
    doanh_thu: row.gross,
    phi_san_uoc_tinh: row.platformFee,
    thuc_nhan_uoc_tinh: row.netEstimate,
    chung_tu: row.certificateCode || "",
  })));

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sao-ke-thue-${report.year}.csv"`,
    },
  });
}
