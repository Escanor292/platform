import { prisma } from '@/lib/prisma';

class CommentService {
    public async post(data: {
        campaignId: string;
        userId: string;
        userName: string;
        userAvatar?: string;
        content: string;
        parentId?: string | null;
        depth: number;
    }) {
        const comment = await prisma.campaign_comments.create({
            data: {
                campaignId: data.campaignId,
                userId: data.userId,
                userName: data.userName,
                userAvatar: data.userAvatar ?? null,
                content: data.content,
                parentId: data.parentId ?? null,
                depth: data.depth,
            },
        });
        if (data.parentId) {
            await prisma.campaign_comments
                .update({
                    where: { id: data.parentId },
                    data: { replyCount: { increment: 1 } },
                })
                .catch(() => { });
        }
        return comment;
    }

    public async edit(commentId: string, userId: string, newContent: string) {
        const existing = await prisma.campaign_comments.findFirst({
            where: { id: commentId, userId, isDeleted: false },
        });
        if (!existing) return null;
        const history = Array.isArray(existing.editHistory)
            ? (existing.editHistory as any[])
            : [];
        return prisma.campaign_comments.update({
            where: { id: commentId },
            data: {
                content: newContent,
                isEdited: true,
                editHistory: [...history, { content: existing.content, editedAt: new Date() }] as any,
            },
        });
    }

    public async softDelete(commentId: string, userId: string) {
        return prisma.campaign_comments.updateMany({
            where: { id: commentId, userId },
            data: { isDeleted: true, content: '[Bình luận đã bị xóa]', status: 'DELETED' },
        });
    }

    public async hide(commentId: string) {
        return prisma.campaign_comments.update({
            where: { id: commentId },
            data: { status: 'HIDDEN' },
        });
    }

    public async toggleReaction(commentId: string, userId: string, type: string) {
        const existing = await prisma.campaign_comment_reactions.findUnique({
            where: { commentId_userId_type: { commentId, userId, type } },
        });
        if (existing) {
            await prisma.campaign_comment_reactions.delete({
                where: { commentId_userId_type: { commentId, userId, type } },
            });
        } else {
            await prisma.campaign_comment_reactions.create({
                data: { commentId, userId, type },
            });
        }
    }

    public async getCampaignComments(
        campaignId: string,
        options: { limit?: number; skip?: number; sort?: 'newest' | 'oldest' } = {}
    ) {
        const { limit = 20, skip = 0, sort = 'newest' } = options;
        return prisma.campaign_comments.findMany({
            where: { campaignId, parentId: null, isDeleted: false, status: 'APPROVED' },
            orderBy: { createdAt: sort === 'newest' ? 'desc' : 'asc' },
            skip,
            take: limit,
            include: { comment_reactions: true },
        });
    }

    public async getReplies(parentId: string, limit = 10) {
        return prisma.campaign_comments.findMany({
            where: { parentId, isDeleted: false, status: 'APPROVED' },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
    }

    public async countByCampaign(campaignId: string) {
        return prisma.campaign_comments.count({
            where: { campaignId, parentId: null, isDeleted: false },
        });
    }

    public async getById(commentId: string) {
        return prisma.campaign_comments.findUnique({ where: { id: commentId } });
    }
}

export const commentService = new CommentService();
