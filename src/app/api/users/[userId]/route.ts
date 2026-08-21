import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canExposePrivacyField } from "@/lib/profile-settings";

export async function GET(
  _req: Request,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await context.params;
    const session = await auth();
    const isOwner = session?.user?.id === userId;
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatar: true,
        displayName: true,
        role: true,
        status: true,
        bio: true,
        location: true,
        website: true,
        phone: true,
        socialLinks: true,
        privacySettings: true,
        createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const publicAccess = !isOwner;
    const visible = {
      email: canExposePrivacyField(user.role, user.privacySettings, 'email', !publicAccess),
      phone: canExposePrivacyField(user.role, user.privacySettings, 'phone', !publicAccess),
      location: canExposePrivacyField(user.role, user.privacySettings, 'location', !publicAccess),
      bio: canExposePrivacyField(user.role, user.privacySettings, 'bio', !publicAccess),
      website: canExposePrivacyField(user.role, user.privacySettings, 'website', !publicAccess),
      socialLinks: canExposePrivacyField(user.role, user.privacySettings, 'socialLinks', !publicAccess),
    };

    return NextResponse.json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      image: user.image,
      avatar: user.avatar,
      createdAt: user.createdAt,
      email: visible.email ? user.email : null,
      phone: visible.phone ? user.phone : null,
      location: visible.location ? user.location : null,
      bio: visible.bio ? user.bio : null,
      website: visible.website ? user.website : null,
      socialLinks: visible.socialLinks ? user.socialLinks : null,
    });
  } catch (error) {
    console.error("[GET /api/users/:userId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
