import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Gift, Package, Users } from "lucide-react";
import RewardsManagementClient from "./RewardsManagementClient";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CampaignRewardsPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { slug } = await params;

    const campaign = await prisma.campaign.findFirst({
        where: {
            slug,
            creatorId: (session.user as any).id,
        },
        include: {
            rewards: {
                orderBy: { minAmount: "asc" },
                include: {
                    _count: {
                        select: {
                            pledges: true
                        }
                    }
                }
            }
        }
    });

    if (!campaign) {
        notFound();
    }

    // Serialize the data for client component
    const serializedCampaign = {
        id: campaign.id,
        slug: campaign.slug,
        title: campaign.title,
        campaignCode: campaign.campaignCode,
        status: campaign.status,
        rewards: campaign.rewards.map(reward => ({
            id: reward.id,
            title: reward.title,
            description: reward.description,
            minAmount: Number(reward.minAmount),
            maxQuantity: reward.maxQuantity,
            deliveryDate: reward.deliveryDate,
            isActive: reward.isActive,
            createdAt: reward.createdAt,
            _count: reward._count
        }))
    };

    return (
        <div className="min-h-screen bg-slate-50/50 py-24 px-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/dashboard/creator"
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-gray-900">Quản lý quà tặng</h1>
                        <p className="text-gray-400 font-medium">
                            {campaign.title} • #{campaign.campaignCode}
                        </p>
                    </div>
                    <Link
                        href={`/dashboard/creator/rewards/${campaign.slug}/create`}
                        className="px-6 py-3 bg-orange-600 text-white rounded-2xl font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Thêm quà tặng
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                                <Gift className="text-orange-600" size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 font-bold">Tổng quà tặng</div>
                                <div className="text-2xl font-black text-gray-900">
                                    {campaign.rewards.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                                <Package className="text-green-600" size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 font-bold">Đang hoạt động</div>
                                <div className="text-2xl font-black text-green-600">
                                    {campaign.rewards.filter(r => r.isActive).length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Users className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 font-bold">Lượt chọn</div>
                                <div className="text-2xl font-black text-blue-600">
                                    {campaign.rewards.reduce((sum, r) => sum + r._count.pledges, 0)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <span className="text-purple-600 font-bold text-lg">₫</span>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 font-bold">Giá trị thấp nhất</div>
                                <div className="text-2xl font-black text-purple-600">
                                    {campaign.rewards.length > 0
                                        ? `${Math.min(...campaign.rewards.map(r => Number(r.minAmount))).toLocaleString('vi-VN')}₫`
                                        : '0₫'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rewards Management */}
                <RewardsManagementClient campaign={serializedCampaign} />
            </div>
        </div>
    );
}