import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { creatorTaxReport } from "@/lib/tax/ledger";
import { moneyFlowLabel, type MoneyFlow } from "@/lib/tax/money-flow";
import { formatVND } from "@/lib/utils";

export default async function CreatorTaxPage({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/dashboard/creator/thue");

  const params = searchParams ? await searchParams : {};
  const year = Number(params.year || new Date().getFullYear());
  const report = await creatorTaxReport(userId, Number.isFinite(year) ? year : new Date().getFullYear());
  const flows: MoneyFlow[] = ["NO_GIFT", "GIFT_NOW", "PREORDER"];

  return (
    <main className="min-h-screen bg-slate-50/50 px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/dashboard/creator" className="text-sm font-bold text-gray-400 hover:text-pgreen">
              ← Dashboard Creator
            </Link>
            <h1 className="mt-3 font-display text-4xl font-black text-gray-900">Sổ thuế / sao kê</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Sàn chưa khấu trừ hay nộp thuế hộ. Đây là sổ đối chiếu kiểu Shopee: người mua trả giá niêm yết,
              phí dịch vụ ước tính trừ phía Creator, chứng từ không phải hóa đơn GTGT.
            </p>
          </div>
          <a
            href={`/api/creator/thue?year=${report.year}`}
            className="rounded-full bg-pgreen px-5 py-2.5 text-sm font-bold text-white"
          >
            Tải CSV {report.year}
          </a>
        </div>

        {report.threshold.overThreshold ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            Doanh thu năm {report.year} đã vượt ngưỡng 1 tỷ đồng. Hộ/cá nhân kinh doanh cần hóa đơn điện tử và kê khai theo luật hiện hành.
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-100 bg-white p-5 text-sm text-gray-600">
            Doanh thu ghi nhận {formatVND(report.totals.gross)} / 1.000.000.000đ ngưỡng CNKD {report.year}.
            Còn {formatVND(report.threshold.remaining)} trước ngưỡng.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-6 border border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Doanh thu</div>
            <div className="mt-2 text-2xl font-black">{formatVND(report.totals.gross)}</div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 border border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Phí sàn ước tính</div>
            <div className="mt-2 text-2xl font-black">{formatVND(report.totals.fee)}</div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 border border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Thực nhận ước tính</div>
            <div className="mt-2 text-2xl font-black text-pgreen">{formatVND(report.totals.net)}</div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 border border-gray-100">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Khấu trừ hộ</div>
            <div className="mt-2 text-2xl font-black">0đ</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {flows.map((flow) => {
            const bucket = report.byFlow[flow] || { count: 0, gross: 0, net: 0 };
            return (
              <div key={flow} className="rounded-[2rem] border border-gray-100 bg-white p-6">
                <div className="text-sm font-black">{moneyFlowLabel(flow)}</div>
                <p className="mt-2 text-sm text-gray-500">{bucket.count} lệnh · {formatVND(bucket.gross)}</p>
                {flow === "PREORDER" ? (
                  <p className="mt-2 text-xs text-amber-700">Đặt trước chưa đưa vào quyết toán thuế tự động.</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Khoản</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
                <th className="px-4 py-3 text-right">Phí ước tính</th>
                <th className="px-4 py-3">Chứng từ</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row) => (
                <tr key={row.pledgeId} className="border-t border-gray-50">
                  <td className="px-4 py-3 text-gray-500">{new Date(row.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{row.rewardTitle}</div>
                    <div className="text-xs text-gray-400">{row.campaignTitle}</div>
                  </td>
                  <td className="px-4 py-3">{moneyFlowLabel(row.flow)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatVND(row.gross)}</td>
                  <td className="px-4 py-3 text-right">{formatVND(row.platformFee)}</td>
                  <td className="px-4 py-3">
                    {row.certificateCode ? (
                      <Link href={`/chung-tu/${row.certificateCode}`} className="font-mono text-xs text-pgreen hover:underline">
                        {row.certificateCode}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">Chưa có lệnh thành công trong năm này.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500">
          Xem khung pháp luật:{" "}
          <Link href="/huong-dan/thue" className="font-bold text-pgreen hover:underline">hướng dẫn thuế</Link>.
        </p>
      </div>
    </main>
  );
}
