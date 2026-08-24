import { prisma } from '@/lib/prisma';
import { getPublicProfileCustomization, normalizeProfileCustomization } from '@/lib/profile-customization';
import { NextResponse } from 'next/server';

interface PublicCustomizationParams {
  params: Promise<{ userId: string }>;
}

export async function GET(_request: Request, { params }: PublicCustomizationParams) {
  try {
    const { userId } = await params;
    if (!userId || userId.length > 128) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const customization = await prisma.profile_customizations.findUnique({
      where: { userId },
      select: { publishedConfig: true },
    });
    const config = normalizeProfileCustomization(customization?.publishedConfig);
    const publicConfig = getPublicProfileCustomization(config, userId);

    return NextResponse.json(
      { config: { preset: publicConfig.preset, theme: publicConfig.theme } },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (error) {
    console.error('[GET /api/profile/customization/public/:userId]', error);
    return NextResponse.json({ error: 'Không thể tải theme profile' }, { status: 500 });
  }
}
