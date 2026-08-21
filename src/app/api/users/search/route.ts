import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { id: query },
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Internal server error", users: [] },
      { status: 500 },
    );
  }
}
