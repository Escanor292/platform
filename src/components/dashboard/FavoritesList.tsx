"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartHandshake, Calendar, TrendingUp, X } from "lucide-react";
import CampaignGrowthProgress from "@/components/campaign/CampaignGrowthProgress";

interface FavoriteCampaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    currentAmount: number;
    goalAmount: number;
    endDate: string | null;
    creatorName: string;
}

export default function FavoritesList() {
    const [favorites, setFavorites] = useState<FavoriteCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = () => {
        // Load from localStorage
        const stored = localStorage.getItem("favoriteCampaigns");
        if (stored) {
            try {
                const favoriteIds = JSON.parse(stored);
                // TODO: Fetch campaign details from API
                // For now, just show empty state
                setFavorites([]);
            } catch (error) {
                console.error("Error loading favorites:", error);
            }
        }
        setLoading(false);
    };

    const removeFavorite = (campaignId: string) => {
        const stored = localStorage.getItem("favoriteCampaigns");
        if (stored) {
            try {
                const favoriteIds = JSON.parse(stored);
                const updated = favoriteIds.filter((id: string) => id !== campaignId);
                localStorage.setItem("favoriteCampaigns", JSON.stringify(updated));
                setFavorites(favorites.filter(f => f.id !== campaignId));
            } catch (error) {
                console.error("Error removing favorite:", error);
            }
        }
    };

    const calculateDaysLeft = (endDate: string | null) => {
        if (!endDate) return "Vô thời hạn";
        const days = Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return days;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pgreen"></div>
            </div>
        );
    }

    if (favorites.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <HeartHandshake size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có chiến dịch quan tâm</h3>
                <p className="text-gray-600 mb-6">
                    Khám phá và đánh dấu các chiến dịch bạn thích để theo dõi tiến độ
                </p>
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-pgreen text-white rounded-lg font-semibold hover:bg-pgreen/90 transition"
                >
                    Khám phá chiến dịch
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((campaign) => {
                const percentRaised = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
                const daysLeft = calculateDaysLeft(campaign.endDate);

                return (
                    <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group relative">
                        {/* Remove Button */}
                        <button
                            onClick={() => removeFavorite(campaign.id)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                            title="Bỏ quan tâm"
                        >
                            <X size={16} className="text-red-600" />
                        </button>

                        <Link href={`/campaigns/${campaign.slug}`}>
                            {/* Image */}
                            <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                {campaign.imageUrl ? (
                                    <img
                                        src={campaign.imageUrl}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {/* Category */}
                                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-3">
                                    {campaign.category}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pgreen transition">
                                    {campaign.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {campaign.description}
                                </p>

                                {/* Progress */}
                                <div className="mb-4">
                                    <CampaignGrowthProgress
                                        currentAmount={campaign.currentAmount}
                                        goalAmount={campaign.goalAmount}
                                        size="sm"
                                        showTree={false}
                                        showAnimatedHead={false}
                                    />
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp size={14} />
                                        <span className="font-semibold">{percentRaised}%</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{typeof daysLeft === "number" ? `${daysLeft} ngày` : daysLeft}</span>
                                    </div>
                                </div>

                                {/* Creator */}
                                <div className="mt-3 text-xs text-gray-500">
                                    Bởi <span className="font-semibold text-gray-700">{campaign.creatorName}</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
}
