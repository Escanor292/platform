import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBlogReviewFields } from "@/lib/blog/blog-review";

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

        if (status && status !== "ALL" && status !== "all") {
            where.status = status;
        }

        const posts = await prisma.blog_posts.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                status: true,
                type: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                viewCount: true,
                likeCount: true,
                commentCount: true,
                bookmarkCount: true,
                isFeatured: true,
                wordCount: true,
                readingTimeMinutes: true,
                authorId: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const reviewFields = await getBlogReviewFields(posts.map((post) => post.id));

        return NextResponse.json({
            posts: posts.map((post) => ({
                ...post,
                rejectionReason: reviewFields[post.id]?.rejectionReason ?? null,
                reviewedAt: reviewFields[post.id]?.reviewedAt ?? null,
                scheduledAt: reviewFields[post.id]?.scheduledAt ?? null,
            })),
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
