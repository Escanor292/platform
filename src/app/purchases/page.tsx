import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import WarehouseClient from "@/components/purchases/WarehouseClient";
import { isDigitalFulfillment } from "@/lib/warehouse-ui";
import { DEMO_WAREHOUSE_USER_ID, seedDemoWarehouseItems } from "@/lib/digital-warehouse";
import { claimCertificatesForUser } from "@/lib/tax/certificate";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams?: Promise<{ item?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/purchases");

  if (userId === DEMO_WAREHOUSE_USER_ID) {
    await seedDemoWarehouseItems(userId);
  }

  await claimCertificatesForUser({
    id: userId,
    email: session?.user?.email,
  });

  const params = searchParams ? await searchParams : {};
  const highlightId = typeof params.item === "string" ? params.item : undefined;

  const [pledges, certificates] = await Promise.all([
    prisma.pledges.findMany({
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
    }),
    prisma.donation_certificates.findMany({
      where: {
        status: { not: "REVOKED" },
        OR: [{ backerUserId: userId }, { claimedByUserId: userId }],
      },
      include: { campaigns: { select: { title: true } } },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const digitalItems = pledges
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
      href: null as string | null,
    }));

  const certificateItems = certificates.map((certificate) => ({
    pledgeId: certificate.pledgeId,
    purchasedAt: certificate.issuedAt.toISOString(),
    quantity: 1,
    amount: Number(certificate.amount),
    title: certificate.documentKind === "CERTIFICATE"
      ? `Chứng nhận ủng hộ · ${certificate.campaigns?.title || certificate.code}`
      : `Biên lai · ${certificate.campaigns?.title || certificate.code}`,
    rewardId: null,
    fulfillmentType: "CERTIFICATE",
    cover: null,
    assetUrl: null,
    licenseKey: certificate.code,
    status: "DELIVERED",
    href: `/chung-tu/${certificate.code}`,
  }));

  const items = [...certificateItems, ...digitalItems];

  return (
    <main className="min-h-screen gradient-warm py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-pgreen">Tài khoản của bạn</p>
            <h1 className="mt-1 font-display text-4xl font-bold text-dblue">Kho đồ</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-500">
              Mọi tài khoản đều có kho đồ. Chứng nhận ủng hộ, biên lai, game, truyện, ảnh, video và mã bản quyền vào đây sau khi đối soát thanh toán.
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
