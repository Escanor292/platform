import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditRewardForm from "@/app/dashboard/creator/rewards/[slug]/edit/[rewardId]/EditRewardForm";

interface PageProps {
    params: Promise<{
        projectId: string;
        rewardId: string;
    }>;
}

export default async function EditProjectRewardPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { projectId, rewardId } = await params;
    const userId = (session.user as any).id;

    const project = await prisma.projects.findFirst({
        where: { id: projectId, creatorId: userId },
        select: { id: true, title: true },
    });
    if (!project) notFound();

    const reward = await prisma.rewards.findFirst({
        where: {
            id: rewardId,
            OR: [
                { projectId: project.id },
                { project_reward_links: { some: { projectId: project.id } } },
                { campaigns: { projectId: project.id, creatorId: userId } },
            ],
        },
        include: {
            campaigns: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    campaignCode: true,
                    status: true,
                },
            },
            _count: {
                select: {
                    pledges: true,
                },
            },
        },
    });

    if (!reward) {
        notFound();
    }

    const serializedReward = {
        id: reward.id,
        title: reward.title,
        description: reward.description,
        minAmount: Number(reward.minAmount),
        maxQuantity: reward.maxQuantity,
        availability: reward.availability,
        deliveryDate: reward.deliveryDate?.toISOString().split("T")[0] || null,
        isPreorder: reward.isPreorder,
        onlineDepositPercent: reward.onlineDepositPercent,
        codDepositPercent: reward.codDepositPercent,
        isActive: reward.isActive,
        fulfillmentType: reward.fulfillmentType,
        _count: reward._count,
        campaign: reward.campaigns
            ? {
                id: reward.campaigns.id,
                slug: reward.campaigns.slug,
                title: reward.campaigns.title,
                campaignCode: reward.campaigns.campaignCode,
                status: reward.campaigns.status,
            }
            : null,
        successHref: `/projects/${project.id}`,
    };

    return (
        <div className="min-h-screen bg-cream/50 py-24 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/projects/${project.id}`}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Chỉnh sửa sản phẩm</h1>
                        <p className="text-gray-400 font-medium">{project.title}</p>
                    </div>
                </div>
                <EditRewardForm reward={serializedReward} />
            </div>
        </div>
    );
}
