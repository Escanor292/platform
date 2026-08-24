import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditRewardForm from "./EditRewardForm";

interface PageProps {
    params: Promise<{
        slug: string;
        rewardId: string;
    }>;
}

export default async function EditRewardPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { slug, rewardId } = await params;

    const reward = await prisma.rewards.findFirst({
        where: {
            id: rewardId,
            campaigns: {
                slug,
                creatorId: (session.user as any).id,
            },
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

    // Serialize the data for client component
    const serializedReward = {
        id: reward.id,
        title: reward.title,
        description: reward.description,
        minAmount: Number(reward.minAmount),
        maxQuantity: reward.maxQuantity,
        availability: reward.availability,
        deliveryDate: reward.deliveryDate?.toISOString().split('T')[0] || null,
        isPreorder: reward.isPreorder,

        isActive: reward.isActive,
        _count: reward._count,
        campaign: reward.campaigns!,
    };

    return (
        <div className="min-h-screen bg-cream/50 py-24 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/dashboard/creator/rewards/${reward.campaigns!.slug}`}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Chỉnh sửa quà tặng</h1>
                        <p className="text-gray-400 font-medium">
                            {reward.campaigns!.title} • #{reward.campaigns!.campaignCode}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <EditRewardForm reward={serializedReward} />
            </div>
        </div>
    );
}