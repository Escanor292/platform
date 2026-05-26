import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/blog/my-posts
 * Get current user's blog posts
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        const where: any = {
            authorId: session.user.id,
            deletedAt: null,
        };

        // Filter by status if provided
        if (status && status !== "ALL") {
            where.status = status;
        }

        const posts = await prisma.blogPost.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                status: true,
                publishedAt: true,
                createdAt: true,
                viewCount: true,
                likeCount: true,
                commentCount: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            posts,
            total: posts.length,
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
