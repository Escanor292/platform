import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateRewardForm from "./CreateRewardForm";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CreateRewardPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { slug } = await params;

    const campaign = await prisma.campaigns.findFirst({
        where: {
            slug,
            creatorId: (session.user as any).id,
        },
        select: {
            id: true,
            slug: true,
            title: true,
            campaignCode: true,
            status: true,
        }
    });

    if (!campaign) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-24 px-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/dashboard/creator/rewards/${campaign.slug}`}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">Tạo quà tặng mới</h1>
                        <p className="text-gray-400 font-medium">
                            {campaign.title} • #{campaign.campaignCode}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <CreateRewardForm campaign={campaign} />
            </div>
        </div>
    );
}