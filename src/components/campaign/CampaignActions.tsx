"use client";

import { HeartHandshake, Share2, Flag } from "lucide-react";
import { useState, useEffect } from "react";
import { getFollowButtonClass, getFollowIconClass } from "@/lib/button-styles";
import CampaignReportModal from "./CampaignReportModal";
import { useOwnerView } from "@/components/owner/OwnerViewContext";

interface CampaignActionsProps {
    campaignTitle: string;
    campaignSlug: string;
    campaignId: string;
}

export default function CampaignActions({ campaignTitle, campaignSlug, campaignId }: CampaignActionsProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const { showOwnerUi } = useOwnerView();

    useEffect(() => {
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
            favoriteIds = favoriteIds.filter(id => id !== campaignId);
            localStorage.setItem("favoriteCampaigns", JSON.stringify(favoriteIds));
            setIsFavorited(false);
            alert("Da bo khoi danh sach quan tam!");
        } else {
            favoriteIds.push(campaignId);
            localStorage.setItem("favoriteCampaigns", JSON.stringify(favoriteIds));
            setIsFavorited(true);
            alert("Da them vao danh sach quan tam!");
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/campaigns/${campaignSlug}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: campaignTitle,
                    text: `Xem du an goi von: ${campaignTitle}`,
                    url: url,
                });
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Da copy link du an!");
        }
    };

    return (
        <>
            <div className="flex items-center gap-3">
                {!showOwnerUi && (
                    <button
                        onClick={handleFavorite}
                        data-analytics-cta="campaign_favorite"
                        data-analytics-label={isFavorited ? "Bo quan tam" : "Quan tam"}
                        className={getFollowButtonClass(isFavorited, "flex-1 py-3 px-4")}
                        title={isFavorited ? "Da quan tam" : "Quan tam"}
                    >
                        <HeartHandshake
                            size={16}
                            className={getFollowIconClass(isFavorited)}
                        />
                        {isFavorited ? "Da quan tam" : "Quan tam"}
                    </button>
                )}

                <button
                    onClick={handleShare}
                    data-analytics-cta="campaign_share"
                    data-analytics-label="Chia se"
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold p-3 rounded-lg transition-colors"
                    title="Chia se"
                >
                    <Share2 size={18} className="text-gray-600" />
                </button>

                {!showOwnerUi && (
                    <button
                        onClick={() => setShowReportModal(true)}
                        data-analytics-cta="campaign_report"
                        data-analytics-label="Bao cao chien dich"
                        className="border border-gray-300 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold p-3 rounded-lg transition-colors"
                        title="Bao cao chien dich"
                    >
                        <Flag size={18} className="text-gray-600 hover:text-red-600" />
                    </button>
                )}
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
