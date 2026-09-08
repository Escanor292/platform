import { prisma } from "@/lib/prisma";

async function ensureUserFollowersTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_followers (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (follower_id, following_id)
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS user_followers_following_idx
    ON user_followers (following_id)
  `);
}

export async function getUserFollowStats(userId: string, viewerId?: string | null) {
  try {
    await ensureUserFollowersTable();
    const [followers, following, mine] = await Promise.all([
      prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*)::bigint AS count FROM user_followers WHERE following_id = $1`,
        userId,
      ),
      prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*)::bigint AS count FROM user_followers WHERE follower_id = $1`,
        userId,
      ),
      viewerId
        ? prisma.$queryRawUnsafe<Array<{ follower_id: string }>>(
            `SELECT follower_id FROM user_followers WHERE follower_id = $1 AND following_id = $2 LIMIT 1`,
            viewerId,
            userId,
          )
        : Promise.resolve([]),
    ]);
    return {
      followersCount: Number(followers[0]?.count || 0),
      followingCount: Number(following[0]?.count || 0),
      isFollowing: Boolean(mine[0]),
    };
  } catch (error) {
    console.warn("[USER FOLLOWS STATS]", error);
    return { followersCount: 0, followingCount: 0, isFollowing: false };
  }
}

export async function listFollowingIds(followerId: string): Promise<string[]> {
  try {
    await ensureUserFollowersTable();
    const rows = await prisma.$queryRawUnsafe<Array<{ following_id: string }>>(
      `SELECT following_id FROM user_followers WHERE follower_id = $1`,
      followerId,
    );
    return rows.map((row) => row.following_id);
  } catch (error) {
    console.warn("[USER FOLLOWS LIST]", error);
    return [];
  }
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("Không thể theo dõi chính mình");
  }
  const target = await prisma.users.findUnique({
    where: { id: followingId },
    select: { id: true },
  });
  if (!target) throw new Error("Không tìm thấy người dùng");
  await ensureUserFollowersTable();
  await prisma.$executeRawUnsafe(
    `INSERT INTO user_followers (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (follower_id, following_id) DO NOTHING`,
    followerId,
    followingId,
  );
  return getUserFollowStats(followingId, followerId);
}

export async function unfollowUser(followerId: string, followingId: string) {
  await ensureUserFollowersTable();
  await prisma.$executeRawUnsafe(
    `DELETE FROM user_followers WHERE follower_id = $1 AND following_id = $2`,
    followerId,
    followingId,
  );
  return getUserFollowStats(followingId, followerId);
}
