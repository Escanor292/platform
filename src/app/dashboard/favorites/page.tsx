import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HeartHandshake, ArrowLeft } from "lucide-react";
import FavoritesList from "@/components/dashboard/FavoritesList";

export default async function FavoritesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-pgreen transition mb-4"
                    >
                        <ArrowLeft size={16} />
                        Quay lại Dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <HeartHandshake size={24} className="text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dự án quan tâm</h1>
                            <p className="text-gray-600 mt-1">Các dự án bạn đã đánh dấu quan tâm</p>
                        </div>
                    </div>
                </div>

                {/* Favorites List */}
                <FavoritesList />
            </div>
        </div>
    );
}
