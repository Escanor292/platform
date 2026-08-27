import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import WarehouseClient from "@/components/purchases/WarehouseClient";
import { isDigitalFulfillment } from "@/lib/warehouse-ui";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams?: Promise<{ item?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/purchases");

  const params = searchParams ? await searchParams : {};
  const highlightId = typeof params.item === "string" ? params.item : undefined;

  const pledges = await prisma.pledges.findMany({
    where: {
      userId,
      status: "SUCCESS",
      OR: [
        { fulfillmentType: { in: ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] } },
        { rewards: { fulfillmentType: { in: ["EMAIL", "DOWNLOAD", "LICENSE_KEY", "DIGITAL_COMIC"] } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      rewards: { select: { id: true, title: true, fulfillmentType: true, productImages: true } },
      digitalAsset: { select: { assetUrl: true, encryptedValue: true, assetType: true, status: true } },
    },
  });

  const items = pledges
    .filter((pledge) => isDigitalFulfillment(pledge.fulfillmentType || pledge.rewards?.fulfillmentType))
    .map((pledge) => ({
      pledgeId: pledge.id,
      purchasedAt: pledge.createdAt.toISOString(),
      quantity: pledge.quantity,
      amount: Number(pledge.amount),
      title: pledge.rewards?.title || "Sản phẩm số",
      rewardId: pledge.rewards?.id || null,
      fulfillmentType: pledge.fulfillmentType || pledge.rewards?.fulfillmentType || null,
      cover: pledge.rewards?.productImages?.[0] || null,
      assetUrl: pledge.digitalAsset?.assetUrl || null,
      licenseKey: pledge.digitalAsset?.assetType === "LICENSE_KEY" ? pledge.digitalAsset.encryptedValue : null,
      status: pledge.digitalAsset?.status || "DELIVERED",
    }));

  return (
    <main className="min-h-screen gradient-warm py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-pgreen">Tài khoản của bạn</p>
            <h1 className="mt-1 font-display text-4xl font-bold text-dblue">Kho đồ</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              Mọi tài khoản đều có kho đồ. Game, truyện tranh, ảnh, video và mã bản quyền sẽ vào đây ngay sau khi thanh toán thành công.
            </p>
          </div>
          <Link
            href="/projects"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200"
            style={{ background: "linear-gradient(135deg, #2E8B57, #6BCB77)" }}
          >
            Khám phá thêm
          </Link>
        </div>
        <WarehouseClient items={items} highlightId={highlightId} />
      </div>
    </main>
  );
}
