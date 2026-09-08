import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { followUser, getUserFollowStats, unfollowUser } from "@/lib/user-follows";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await params;
  const session = await auth();
  const viewerId = (session?.user as { id?: string } | undefined)?.id;
  const stats = await getUserFollowStats(userId, viewerId);
  return NextResponse.json(stats);
}

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  const followerId = (session?.user as { id?: string } | undefined)?.id;
  if (!followerId) {
    return NextResponse.json({ error: "Cần đăng nhập để theo dõi." }, { status: 401 });
  }
  const { userId } = await params;
  try {
    const stats = await followUser(followerId, userId);
    return NextResponse.json({ success: true, ...stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không theo dõi được." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  const followerId = (session?.user as { id?: string } | undefined)?.id;
  if (!followerId) {
    return NextResponse.json({ error: "Cần đăng nhập." }, { status: 401 });
  }
  const { userId } = await params;
  const stats = await unfollowUser(followerId, userId);
  return NextResponse.json({ success: true, ...stats });
}
