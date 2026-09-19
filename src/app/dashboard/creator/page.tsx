import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreatorDashboardClient from "./CreatorDashboardClient";
import { getCampaignReviewFields } from "@/lib/moderation/campaign-review";
import { userHasPermission } from "@/lib/permissions";

export default async function CreatorDashboard() {
   const session = await auth();
   if (!session?.user) redirect("/auth/login");

   const role = (session.user as any).role;
   if (role === "BACKER") redirect("/upgrade");

   const pendingBanner = role === "CREATOR_PENDING" ? (
      <div className="mx-auto max-w-6xl px-6 pt-24">
         <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            Hồ sơ Creator đang chờ duyệt. Khi admin xác minh KYC, bạn sẽ tạo được chiến dịch.
            <Link href="/upgrade" className="ml-2 font-bold underline">Xem hồ sơ</Link>
         </div>
      </div>
   ) : null;

   const campaigns = await prisma.campaigns.findMany({
      where: { creatorId: (session.user as any).id },
      include: { _count: { select: { pledges: { where: { status: "SUCCESS" } }, rewards: true } } },
      orderBy: { createdAt: "desc" },
   });

   // Get projects for the creator (for project assignment dropdown)
   const projects = await prisma.projects.findMany({
      where: { creatorId: (session.user as any).id },
      select: {
         id: true,
         title: true,
      },
      orderBy: { createdAt: "desc" },
   });

   const extra = await getCampaignReviewFields(campaigns.map((campaign) => campaign.id));
   const canScanLinks = await userHasPermission(session.user as any, "link.health");

   // Serialize the data for client component
   const serializedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      description: campaign.description,
      campaignCode: campaign.campaignCode,
      imageUrl: campaign.imageUrl,
      category: campaign.category,
      type: campaign.type,
      status: campaign.status,
      currentAmount: Number(campaign.currentAmount),
      goalAmount: Number(campaign.goalAmount),
      endDate: campaign.endDate,
      createdAt: campaign.createdAt,
      projectId: campaign.projectId,
      rejectionReason: extra[campaign.id]?.rejectionReason ?? null,
      hasProducts: (campaign._count as { rewards?: number }).rewards ? campaign._count.rewards > 0 : false,
      fulfillmentConfirmedAt: (campaign as { fulfillmentConfirmedAt?: Date | null }).fulfillmentConfirmedAt ?? null,
      _count: campaign._count,
   }));

   const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.currentAmount), 0);
   const totalBackers = campaigns.reduce((acc, c) => acc + c._count.pledges, 0);

   return (
      <>
         {pendingBanner}
         <CreatorDashboardClient
         campaigns={serializedCampaigns}
         totalRaised={totalRaised}
         totalBackers={totalBackers}
         projects={projects}
         isPro={canScanLinks}
      />
      </>
   );
}
