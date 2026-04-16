import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bio, location, website, phone, shippingAddress, image, coverImage } = await req.json();

    // Lấy user từ database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cập nhật thông tin
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: name || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        phone: phone || null,
        shippingAddress: shippingAddress || null,
        image: image || null,
        coverImage: coverImage || null
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
