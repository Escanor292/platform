/**
 * Public Project Detail Types
 * Used for the public project detail page (accessible without authentication)
 */

export interface PublicProjectDetail {
    id: string;
    creatorId: string;
    title: string;
    slug: string | null;
    description: string | null;
    coverImage: string | null;
    richDescription: any;
    heroBackgroundType?: string;
    heroBackgroundConfig?: any;
    linkedBlogPostIds: string[];
    linkedRewardIds: string[];
    createdAt: string;
    updatedAt: string;
    campaignCount: number;
    blogPostCount: number;
    campaigns: PublicCampaign[];
    blogPosts: PublicBlogPost[];
}

export interface PublicCampaign {
    id: string;
    title: string;
    slug: string;
    status: string;
    type: string;
    goalAmount: number;
    currentAmount: number;
    imageUrl: string | null;
    createdAt: string;
    rewards: PublicReward[];
}

export interface PublicReward {
    id: string;
    title: string;
    description: string | null;
    minAmount: number;
    imageUrl: string | null;
    isIncludedInProject: boolean;
    maxQuantity: number | null;
    deliveryDate: string | null;
    isActive: boolean;
    createdAt: string;
}

export interface PublicBlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: string | null;
}

/**
 * Campaign status badge mapping
 */
export interface CampaignStatusBadge {
    label: string;
    color: string;
    bgColor: string;
}

export function getCampaignStatusBadge(status: string): CampaignStatusBadge {
    const statusMap: Record<string, CampaignStatusBadge> = {
        SUCCESS: {
            label: 'HOÀN THÀNH',
            color: '#137333',
            bgColor: 'bg-green-600'
        },
        COMPLETED: {
            label: 'HOÀN THÀNH',
            color: '#137333',
            bgColor: 'bg-green-600'
        },
        ACTIVE: {
            label: 'ĐANG CHẠY',
            color: '#f9a825',
            bgColor: 'bg-orange-500'
        },
        RUNNING: {
            label: 'ĐANG CHẠY',
            color: '#f9a825',
            bgColor: 'bg-orange-500'
        },
        DRAFT: {
            label: 'COMING SOON',
            color: '#757575',
            bgColor: 'bg-gray-500'
        },
        PENDING: {
            label: 'COMING SOON',
            color: '#757575',
            bgColor: 'bg-gray-500'
        },
        APPROVED: {
            label: 'COMING SOON',
            color: '#757575',
            bgColor: 'bg-gray-500'
        },
        FAILED: {
            label: 'KẾT THÚC',
            color: '#d32f2f',
            bgColor: 'bg-red-600'
        }
    };

    return statusMap[status] || {
        label: status,
        color: '#757575',
        bgColor: 'bg-gray-500'
    };
}
