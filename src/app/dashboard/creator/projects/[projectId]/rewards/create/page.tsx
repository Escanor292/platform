import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateRewardForm from "@/app/dashboard/creator/rewards/[slug]/create/CreateRewardForm";

interface PageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function CreateProjectRewardPage({ params }: PageProps) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { projectId } = await params;
    const project = await prisma.projects.findFirst({
        where: {
            id: projectId,
            creatorId: (session.user as any).id,
        },
        select: {
            id: true,
            title: true,
        },
    });

    if (!project) {
        notFound();
    }

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
                        <h1 className="text-4xl font-black text-gray-900">Tạo sản phẩm dự án</h1>
                        <p className="text-gray-400 font-medium">
                            {project.title}
                        </p>
                    </div>
                </div>
                <CreateRewardForm
                    projectId={project.id}
                    successHref={`/projects/${project.id}`}
                />
            </div>
        </div>
    );
}
