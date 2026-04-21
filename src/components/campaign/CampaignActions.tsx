"use client";

import { HeartHandshake, Share2, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { getFollowButtonClass, getFollowIconClass } from "@/lib/button-styles";
import CampaignReportModal from "./CampaignReportModal";

interface CampaignActionsProps {
    campaignTitle: string;
    campaignSlug: string;
    campaignId: string;
}

export default function CampaignActions({ campaignTitle, campaignSlug, campaignId }: CampaignActionsProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        // Check if campaign is already favorited
        const stored = localStorage.getItem("favoriteCampaigns");
        if (stored) {
            try {
                const favoriteIds = JSON.parse(stored);
                setIsFavorited(favoriteIds.includes(campaignId));
            } catch (error) {
                console.error("Error loading favorites:", error);
            }
        }
    }, [campaignId]);

    const handleFavorite = () => {
        const stored = localStorage.getItem("favoriteCampaigns");
        let favoriteIds: string[] = [];

        if (stored) {
            try {
                favoriteIds = JSON.parse(stored);
            } catch (error) {
                console.error("Error parsing favorites:", error);
            }
        }

        if (isFavorited) {
            // Remove from favorites
            favoriteIds = favoriteIds.filter(id => id !== campaignId);
            localStorage.setItem("favoriteCampaigns", JSON.stringify(favoriteIds));
            setIsFavorited(false);
            alert("Đã bỏ khỏi danh sách quan tâm!");
        } else {
            // Add to favorites
            favoriteIds.push(campaignId);
            localStorage.setItem("favoriteCampaigns", JSON.stringify(favoriteIds));
            setIsFavorited(true);
            alert("Đã thêm vào danh sách quan tâm!");
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/campaigns/${campaignSlug}`;

        // Check if Web Share API is available
        if (navigator.share) {
            try {
                await navigator.share({
                    title: campaignTitle,
                    text: `Xem dự án gọi vốn: ${campaignTitle}`,
                    url: url,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            alert("Đã copy link dự án!");
        }
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <button
                    onClick={handleFavorite}
                    className={getFollowButtonClass(isFavorited, "flex-1 py-3 px-4")}
                    title={isFavorited ? "Đã quan tâm" : "Quan tâm"}
                >
                    <HeartHandshake
                        size={16}
                        className={getFollowIconClass(isFavorited)}
                    />
                    {isFavorited ? "Đã quan tâm" : "Quan tâm"}
                </button>

                <button
                    onClick={handleShare}
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold p-3 rounded-lg transition-colors"
                    title="Chia sẻ"
                >
                    <Share2 size={18} className="text-gray-600" />
                </button>

                <button
                    onClick={() => setShowReportModal(true)}
                    className="border border-gray-300 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold p-3 rounded-lg transition-colors"
                    title="Báo cáo chiến dịch"
                >
                    <Flag size={18} className="text-gray-600 hover:text-red-600" />
                </button>
            </div>

            <CampaignReportModal
                campaignSlug={campaignSlug}
                campaignTitle={campaignTitle}
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            />
        </>
    );
}
