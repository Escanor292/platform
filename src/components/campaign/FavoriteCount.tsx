"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteCountProps {
    campaignId: string;
}

export default function FavoriteCount({ campaignId }: FavoriteCountProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Count how many users have favorited this campaign
        // Since we're using localStorage, we can only count current user
        // In production, this should come from backend
        const stored = localStorage.getItem("favoriteCampaigns");
        if (stored) {
            try {
                const favoriteIds = JSON.parse(stored);
                // For demo: generate a random count between 10-500
                // In production, fetch from API
                const baseCount = Math.floor(Math.random() * 490) + 10;
                const isFavorited = favoriteIds.includes(campaignId);
                setCount(baseCount + (isFavorited ? 1 : 0));
            } catch (error) {
                console.error("Error loading favorites:", error);
            }
        } else {
            // Random count for demo
            setCount(Math.floor(Math.random() * 490) + 10);
        }

        // Listen for storage changes
        const handleStorageChange = () => {
            const stored = localStorage.getItem("favoriteCampaigns");
            if (stored) {
                try {
                    const favoriteIds = JSON.parse(stored);
                    const baseCount = Math.floor(Math.random() * 490) + 10;
                    const isFavorited = favoriteIds.includes(campaignId);
                    setCount(baseCount + (isFavorited ? 1 : 0));
                } catch (error) {
                    console.error("Error:", error);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [campaignId]);

    return (
        <div className="flex items-center gap-3 text-gray-600">
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
            <div>
                <div className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</div>
                <div className="text-sm text-gray-500">người quan tâm</div>
            </div>
        </div>
    );
}
