import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CampaignEditForm from "@/components/campaign/CampaignEditForm";

interface EditCampaignPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const currentUser = session.user as any;

  // Lấy campaign theo slug
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      rewards: true,
    },
  });

  if (!campaign) {
    notFound();
  }

  // Kiểm tra quyền sở hữu
  if (campaign.creatorId !== currentUser.id && currentUser.role !== "ADMIN") {
    redirect(`/campaigns/${campaign.slug}`);
  }

  // Convert Decimal to number for Client Component
  const campaignData = {
    ...campaign,
    goalAmount: Number(campaign.goalAmount),
    currentAmount: Number(campaign.currentAmount),
    feeRate: Number(campaign.feeRate),
    images: campaign.images || [], // Ensure images is always an array
    tags: campaign.tags || [], // Ensure tags is always an array
    rewards: campaign.rewards.map(reward => ({
      ...reward,
      minAmount: Number(reward.minAmount),
    })),
  };

  console.log("[EditCampaignPage] Campaign data:", {
    imageUrl: campaignData.imageUrl,
    images: campaignData.images,
    tags: campaignData.tags
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Chỉnh sửa dự án</h1>
          <p className="text-gray-400">Cập nhật thông tin dự án của bạn</p>
        </div>

        <CampaignEditForm campaign={campaignData} />
      </div>
    </div>
  );
}
