import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePrivacySettings } from "@/lib/profile-settings";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    if (!query) return NextResponse.json({ users: [] });

    const candidates = await prisma.users.findMany({
      where: {
        OR: [
          { id: query },
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, role: true, image: true, privacySettings: true },
      take: 20,
      orderBy: { name: "asc" },
    });

    const users = candidates
      .filter((user) => user.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) || user.id === query || normalizePrivacySettings(user.role, user.privacySettings).email)
      .slice(0, 10)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: normalizePrivacySettings(user.role, user.privacySettings).email ? user.email : null,
        role: user.role,
        image: user.image,
      }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal server error", users: [] }, { status: 500 });
  }
}
