'use client';

import { useState, useEffect } from 'react';
import { Heart, HeartHandshake } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { getFollowButtonClass, getFollowIconClass } from '@/lib/button-styles';

interface FollowButtonProps {
    campaignSlug: string;
    initialFollowersCount?: number;
    className?: string;
    showCount?: boolean;
}

export default function FollowButton({
    campaignSlug,
    initialFollowersCount = 0,
    className = "",
    showCount = true
}: FollowButtonProps) {
    const { data: session } = useSession();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(initialFollowersCount);
    const [isLoading, setIsLoading] = useState(false);
    const [guestEmail, setGuestEmail] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);

    // Check follow status on mount
    useEffect(() => {
        checkFollowStatus();
    }, [campaignSlug, session]);

    const checkFollowStatus = async () => {
        try {
            const url = new URL(`/api/campaigns/${campaignSlug}/follow`, window.location.origin);
            if (!session?.user && guestEmail) {
                url.searchParams.set('email', guestEmail);
            }

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
                setFollowersCount(data.followersCount);
            }
        } catch (error) {
            console.error('Error checking follow status:', error);
        }
    };

    const handleFollow = async () => {
        if (!session?.user && !guestEmail) {
            setShowEmailInput(true);
            return;
        }

        setIsLoading(true);
        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const url = `/api/campaigns/${campaignSlug}/follow`;

            let requestUrl = url;
            let body = null;

            if (method === 'DELETE' && !session?.user) {
                requestUrl += `?email=${encodeURIComponent(guestEmail)}`;
            } else if (method === 'POST' && !session?.user) {
                body = JSON.stringify({ email: guestEmail });
            }

            const response = await fetch(requestUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.isFollowing);
                setFollowersCount(prev => data.isFollowing ? prev + 1 : prev - 1);

                toast.success(data.message);
                setShowEmailInput(false);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error('Có lỗi xảy ra khi thực hiện');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (guestEmail.trim()) {
            handleFollow();
        }
    };

    if (showEmailInput && !session?.user) {
        return (
            <div className="space-y-3">
                <form onSubmit={handleEmailSubmit} className="space-y-2">
                    <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Nhập email để quan tâm dự án"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isLoading || !guestEmail.trim()}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Quan tâm'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowEmailInput(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={handleFollow}
                disabled={isLoading}
                className={`${getFollowButtonClass(isFollowing, "px-4 py-2")} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isFollowing ? (
                    <HeartHandshake className={`w-4 h-4 ${getFollowIconClass(isFollowing)}`} />
                ) : (
                    <Heart className={`w-4 h-4 ${getFollowIconClass(isFollowing)}`} />
                )}
                <span>
                    {isLoading
                        ? 'Đang xử lý...'
                        : isFollowing
                            ? 'Đã quan tâm'
                            : 'Quan tâm'
                    }
                </span>
            </button>

            {showCount && (
                <span className="text-sm text-gray-600 font-medium">
                    {followersCount.toLocaleString('vi-VN')} người quan tâm
                </span>
            )}
        </div>
    );
}