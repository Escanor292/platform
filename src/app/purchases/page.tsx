import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageOpen, Mail, Download, KeyRound, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";

export default async function PurchasesPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/auth/signin?callbackUrl=/purchases");

  const pledges = await prisma.pledges.findMany({
    where: { userId, status: "SUCCESS", rewards: { fulfillmentType: { not: "PHYSICAL" } } },
    orderBy: { createdAt: "desc" },
    include: {
      rewards: { select: { id: true, title: true, fulfillmentType: true, productImages: true } },
      digitalAsset: { select: { assetUrl: true, assetType: true, status: true, deliveredAt: true, claimedAt: true } },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-pgreen">Tài sản của tôi</p><h1 className="mt-1 text-3xl font-black text-gray-900">Kho đã mua</h1><p className="mt-2 text-sm text-gray-500">Nơi lưu các phần quà số, mã bản quyền và truyện số bạn đã mua.</p></div><Link href="/products" className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-pgreen hover:text-pgreen">Khám phá sản phẩm</Link></div>
        {pledges.length === 0 ? <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center"><PackageOpen className="mx-auto mb-4 text-gray-300" size={48} /><p className="font-semibold text-gray-800">Kho đã mua đang trống</p><p className="mt-1 text-sm text-gray-500">Các tài sản số sau khi thanh toán thành công sẽ xuất hiện ở đây.</p></div> : <div className="grid gap-4 md:grid-cols-2">{pledges.map((pledge) => { const asset = pledge.digitalAsset; const type = pledge.rewards?.fulfillmentType; const Icon = type === "LICENSE_KEY" ? KeyRound : type === "EMAIL" ? Mail : Download; return <article key={pledge.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-soft"><div className="flex gap-4"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream/60">{pledge.rewards?.productImages?.[0] && <img src={pledge.rewards.productImages[0]} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><Link href={`/products/${pledge.rewards?.id}`} className="font-bold text-gray-900 hover:text-pgreen">{pledge.rewards?.title || "Tài sản số"}</Link><p className="mt-1 text-xs text-gray-500">Đã mua {new Date(pledge.createdAt).toLocaleDateString("vi-VN")} · {pledge.quantity} sản phẩm</p></div></div><div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">{asset?.assetUrl ? <a href={asset.assetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-pgreen hover:underline"><Icon size={17} /> Mở tài sản đã mua</a> : <div className="flex items-start gap-2 text-sm text-amber-700"><Clock size={17} className="mt-0.5 shrink-0" /><span>Thanh toán đã xác nhận. Nhà sáng tạo đang chuẩn bị tài sản; bạn sẽ thấy liên kết tại đây khi hoàn tất.</span></div>}</div><div className="mt-3 flex items-center justify-between text-xs text-gray-500"><span>{type === "LICENSE_KEY" ? "Mã bản quyền" : type === "DIGITAL_COMIC" ? "Truyện số" : type === "EMAIL" ? "Gửi qua email" : "Tải xuống"}</span><span>{formatVND(Number(pledge.amount))}</span></div></article>; })}</div>}
      </div>
    </main>
  );
}
