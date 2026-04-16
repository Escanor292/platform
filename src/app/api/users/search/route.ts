import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "id";
    const query = searchParams.get("query") || "";

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    let users;

    switch (type) {
      case "id":
        // Tìm theo ID chính xác
        const userById = await prisma.user.findUnique({
          where: { id: query },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        });
        users = userById ? [userById] : [];
        break;

      case "email":
        // Tìm theo email (có thể tìm một phần)
        users = await prisma.user.findMany({
          where: {
            email: {
              contains: query,
              mode: "insensitive"
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          },
          take: 10
        });
        break;

      case "name":
        // Tìm theo tên (có thể tìm một phần)
        users = await prisma.user.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive"
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          },
          take: 10
        });
        break;

      default:
        users = [];
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Internal server error", users: [] },
      { status: 500 }
    );
  }
}
