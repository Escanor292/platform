import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { normalizeNotificationSettings, normalizePrivacySettings } from "@/lib/profile-settings";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, bio, location, website, phone, shippingAddress, image, coverImage, socialLinks } = body;
    const dbUser = await prisma.users.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true, privacySettings: true, notificationSettings: true },
    });
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updatedUser = await prisma.users.update({
      where: { id: dbUser.id },
      data: {
        name: name || null,
        bio: bio || null,
        location: location || null,
        website: website || null,
        phone: phone || null,
        shippingAddress: shippingAddress || null,
        image: image || null,
        coverImage: coverImage || null,
        socialLinks: socialLinks || null,
        privacySettings: normalizePrivacySettings(dbUser.role, body.privacySettings ?? dbUser.privacySettings) as any,
        notificationSettings: normalizeNotificationSettings(body.notificationSettings ?? dbUser.notificationSettings) as any,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
