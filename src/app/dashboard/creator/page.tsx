import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreatorDashboardClient from "./CreatorDashboardClient";

export default async function CreatorDashboard() {
   const session = await auth();
   if (!session?.user) redirect("/auth/login");

   const campaigns = await prisma.campaign.findMany({
      where: { creatorId: (session.user as any).id },
      include: { _count: { select: { pledges: true } } },
      orderBy: { createdAt: "desc" },
   });

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
      _count: campaign._count,
   }));

   const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.currentAmount), 0);
   const totalBackers = campaigns.reduce((acc, c) => acc + c._count.pledges, 0);

   return (
      <CreatorDashboardClient
         campaigns={serializedCampaigns}
         totalRaised={totalRaised}
         totalBackers={totalBackers}
      />
   );
}
