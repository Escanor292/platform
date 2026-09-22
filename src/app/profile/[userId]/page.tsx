import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Heart, Rocket, Award, TrendingUp, Settings, ShieldCheck, Eye, EyeOff, Palette } from "lucide-react";
import { auth } from "@/lib/auth";
import UserIdDisplay from "@/components/profile/UserIdDisplay";
import SocialLinks from "@/components/profile/SocialLinks";
import { SocialLink } from "@/types/social";
import { StartChatButton } from "@/components/chat/StartChatButton";
import ReportButton from "@/components/report/ReportButton";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { UserFollowButton } from "@/components/profile/UserFollowButton";
import { ProfileNoteBubble } from "@/components/profile/ProfileNoteBubble";
import { ShareProfileThemeButton } from "@/components/profile/ShareProfileThemeButton";
import { getUserFollowStats } from "@/lib/user-follows";
import { getActiveSelfNote } from "@/services/mongodb/chat.service";
import { userHasPermission } from "@/lib/permissions";
import { canExposePrivacyField } from "@/lib/profile-settings";
import { getPublicProfileCustomization, isLayoutSectionVisible, normalizeProfileCustomization, profileAudience, resolveProfileLayout } from "@/lib/profile-customization";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { userId } = await params;
  const { preview } = await searchParams;
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = currentUserId === userId;
  const showAsPublic = isOwnProfile && preview === "public";

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      campaigns: {
        where: { status: { in: ["ACTIVE", "SUCCESS"] } },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { pledges: true } }
        }
      },
      pledges: {
        where: { status: "SUCCESS" },
        include: {
          campaigns: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              type: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      },
      blog_posts: {
        where: {
          deletedAt: null,
          ...(isOwnProfile && !showAsPublic
            ? {}
            : {
              status: 'PUBLISHED',
              visibility: 'PUBLIC'
            })
        },
        orderBy: isOwnProfile && !showAsPublic
          ? { updatedAt: 'desc' }
          : { publishedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          viewCount: true,
          likeCount: true,
          commentCount: true,
        }
      },
      projects: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { project_reward_links: true } },
          rewards: {
            where: { isActive: true },
            select: {
              id: true,
              title: true,
              description: true,
              minAmount: true,
              maxAmount: true,
              campaignId: true,
              stock: true,
              maxQuantity: true,
              deliveryDate: true,
              isPreorder: true,
              isActive: true,
              productImages: true,
              productVideo: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          project_blog_links: { select: { blogPostId: true } },
          campaigns: {
            where: { status: { in: ["ACTIVE", "SUCCESS"] } },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              type: true,
              imageUrl: true,
              createdAt: true,
              rewards: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  minAmount: true,
                  maxAmount: true,
                  stock: true,
                  maxQuantity: true,
                  deliveryDate: true,
                  isPreorder: true,
                  isActive: true,
                  productImages: true,
                  productVideo: true,
                  createdAt: true,
                },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      profile_customization: {
        select: { draftConfig: true, publishedConfig: true, publishedAt: true },
      },
      _count: {
        select: {
          campaigns: true,
          pledges: true
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const profileIsPublic = !isOwnProfile || showAsPublic;
  const storedProfileConfig = normalizeProfileCustomization(
    profileIsPublic ? user.profile_customization?.publishedConfig : user.profile_customization?.draftConfig
  );
  const profileConfig = resolveProfileLayout(
    profileIsPublic ? getPublicProfileCustomization(storedProfileConfig, userId) : storedProfileConfig
  );
  const audience = profileAudience(isOwnProfile, showAsPublic);
  const showLocation = canExposePrivacyField(user.role, user.privacySettings, 'location', !profileIsPublic);
  const showBio = canExposePrivacyField(user.role, user.privacySettings, 'bio', !profileIsPublic);
  const showWebsite = canExposePrivacyField(user.role, user.privacySettings, 'website', !profileIsPublic);
  const showSocialLinks = canExposePrivacyField(user.role, user.privacySettings, 'socialLinks', !profileIsPublic);
  const showEmail = canExposePrivacyField(user.role, user.privacySettings, 'email', !profileIsPublic);
  const showPhone = canExposePrivacyField(user.role, user.privacySettings, 'phone', !profileIsPublic);

  const serializedCampaigns = user.campaigns.map(campaign => ({
    ...campaign,
    goalAmount: Number(campaign.goalAmount),
    currentAmount: Number(campaign.currentAmount),
    feeRate: Number(campaign.feeRate),
  }));

  const serializedPledges = user.pledges.map(pledge => ({
    ...pledge,
    amount: Number(pledge.amount),
  }));

  const serializedProjects = (user.projects || []).map(project => ({
    ...project,
    campaigns: project.campaigns.map(campaign => ({
      ...campaign,
      rewards: campaign.rewards.map(reward => ({
        ...reward,
        minAmount: Number(reward.minAmount),
        maxAmount: reward.maxAmount !== null ? Number(reward.maxAmount) : null,
      })),
    })),
    rewards: ((project as any).rewards as any[])
      .filter((reward: any) => !reward.campaignId)
      .map((reward: any) => ({
        ...reward,
        minAmount: Number(reward.minAmount),
        maxAmount: reward.maxAmount !== null ? Number(reward.maxAmount) : null,
      })),
  }));

  const totalRaised = user.campaigns.reduce((sum, c) => sum + Number(c.currentAmount), 0);
  const totalBackers = user.campaigns.reduce((sum, c) => sum + c._count.pledges, 0);
  const totalSupported = user.pledges.reduce((sum, p) => sum + Number(p.amount), 0);
  const successfulCampaigns = user.campaigns.filter(c => c.status === "SUCCESS").length;

  const isCreator = user.role === "CREATOR";
  const isBacker = user._count.pledges > 0;
  const followStats = await getUserFollowStats(userId, currentUserId);
  const profileNote = await getActiveSelfNote(userId);
  const badgeCount = await prisma.user_badges.count({
    where: {
      user_id: userId,
      is_visible: true,
      revoked_at: null,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      badges: { is_active: true, deleted_at: null },
    },
  });
  const canEditProfile = isOwnProfile && (await userHasPermission(session?.user as any, "profile.edit"));
  const canCustomizeProfile = isOwnProfile && (await userHasPermission(session?.user as any, "profile.customize"));

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 md:py-24" style={{ backgroundColor: "var(--profile-background)", fontFamily: "var(--profile-font)" }}>
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <div className="overflow-hidden border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] shadow-sm" style={{ borderRadius: "var(--profile-shell-radius)" }}>
          <div className="relative h-36 md:h-64" style={{ background: "var(--profile-gradient)" }}>
            {user.coverImage ? (
              <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: "var(--profile-gradient)" }} />
            )}
          </div>

          <div className="relative px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-20">
            <div className="absolute -top-10 left-4 md:-top-16 md:left-8">
              <div className="relative">
                <ProfileNoteBubble
                  userId={userId}
                  userName={user.name || "Bạn"}
                  initialNote={profileNote}
                  canEdit={isOwnProfile && !showAsPublic}
                />
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-blue-600 to-purple-600 text-3xl font-black text-white shadow-xl md:h-32 md:w-32 md:rounded-[2rem] md:text-4xl">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                  )}
                </div>
              </div>
            </div>

            {isOwnProfile && !showAsPublic && (
              <div className="mb-4 mt-12 flex flex-wrap gap-2 md:absolute md:right-8 md:top-6 md:mb-0 md:mt-0">
                <Link href={`/profile/${userId}?preview=public`} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-200 sm:px-4 sm:text-sm" title="Xem giao diện công khai">
                  <Eye size={16} /> Chế độ xem
                </Link>
                {canCustomizeProfile && (
                <ShareProfileThemeButton defaultTitle={user.name ? `Giao diện ${user.name}` : "Giao diện của tôi"} />
                )}
                {canCustomizeProfile && (
                <Link href={`/profile/${userId}/customize`} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-900 transition hover:bg-gray-200 sm:px-4 sm:text-sm">
                  <Palette size={16} /> Giao diện
                </Link>
                )}
                {canEditProfile && (
                <Link href={`/profile/${userId}/edit`} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-bold text-gray-900 transition hover:bg-gray-200 sm:px-4 sm:text-sm">
                  <Settings size={16} /> Chỉnh sửa
                </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 sm:px-4 sm:text-sm">
                    <ShieldCheck size={16} /> Quản trị
                  </Link>
                )}
                {user.role === "CREATOR" && (
                  <Link href="/dashboard/creator" className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 sm:px-4 sm:text-sm">
                    <Rocket size={16} /> Quản lý chiến dịch
                  </Link>
                )}
                {(user.role === "BACKER" || user.role === "CREATOR_PENDING") && (
                  <Link href="/upgrade" className="inline-flex items-center gap-1.5 rounded-xl bg-pgreen px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 sm:px-4 sm:text-sm">
                    <Rocket size={16} /> {user.role === "CREATOR_PENDING" ? "Hồ sơ Creator" : "Nâng cấp Creator"}
                  </Link>
                )}
              </div>
            )}

            {isOwnProfile && showAsPublic && (
              <div className="mb-4 mt-12 md:absolute md:right-8 md:top-20 md:mb-0 md:mt-0">
                <Link href={`/profile/${userId}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700" title="Quay về chế độ chủ sở hữu">
                  <EyeOff size={16} /> Chế độ khách
                </Link>
              </div>
            )}

            {(!isOwnProfile || showAsPublic) && (
              <div className="mb-4 mt-12 flex flex-wrap items-center gap-2 md:absolute md:right-8 md:top-6 md:mb-0 md:mt-0">
                {!isOwnProfile && (
                  <UserFollowButton
                    userId={userId}
                    initialIsFollowing={followStats.isFollowing}
                    initialFollowersCount={followStats.followersCount}
                  />
                )}
                {currentUserId && (
                  <StartChatButton
                    campaignOwnerId={userId}
                    campaignOwnerName={user.name || "Người dùng"}
                    variant="none"
                    label="Nhắn tin"
                    className="rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-800 hover:bg-gray-50"
                  />
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="break-words text-xl font-black text-gray-900 md:text-3xl">{user.name || "Người dùng ẩn danh"}</h1>
                {user.status === "PRO" && (
                  <div className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-black uppercase flex items-center gap-1">
                    <Award size={12} /> Pro
                  </div>
                )}
                {user.role === "ADMIN" && (
                  <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase">Admin</div>
                )}
                {!isOwnProfile && (
                  <ReportButton
                    targetType="PROFILE"
                    targetId={user.id}
                    targetTitle={user.name || "Trang cá nhân"}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  />
                )}
              </div>

              {isLayoutSectionVisible(profileConfig, "about", audience) && (
                <>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--profile-muted)]">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Tham gia {new Date(user.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                    </div>
                    {user.location && showLocation && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} /> {user.location}
                      </div>
                    )}
                    <div>
                      {followStats.followersCount} người theo dõi · {followStats.followingCount} đang theo dõi
                    </div>
                  </div>
                  <div><UserIdDisplay userId={user.id} /></div>
                  {user.bio && showBio && (<p className="text-gray-600 max-w-3xl leading-relaxed">{user.bio}</p>)}
                  {user.socialLinks && showSocialLinks && Array.isArray(user.socialLinks) && (user.socialLinks as SocialLink[]).length > 0 && (
                    <div className="pt-2"><SocialLinks links={user.socialLinks as SocialLink[]} size="md" /></div>
                  )}
                  {(showEmail || showPhone || (showWebsite && user.website)) && (
                    <div className="flex flex-wrap gap-3 pt-2 text-sm text-gray-600">
                      {showEmail && user.email && <span className="rounded-full bg-gray-50 px-3 py-1">Email: {user.email}</span>}
                      {showPhone && user.phone && <span className="rounded-full bg-gray-50 px-3 py-1">Điện thoại: {user.phone}</span>}
                      {showWebsite && user.website && <a href={user.website} target="_blank" rel="noreferrer" className="rounded-full bg-gray-50 px-3 py-1 text-pgreen hover:underline">Website</a>}
                    </div>
                  )}
                </>
              )}

              {isLayoutSectionVisible(profileConfig, "analytics", audience) && (
                <div className="flex flex-wrap gap-8 pt-4">
                  {isCreator && (
                    <>
                      <div>
                        <div className="text-2xl font-black text-gray-900">{user._count.campaigns}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Dự án</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-blue-600">{formatVND(totalRaised)}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Đã huy động</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-green-600">{totalBackers}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Người ủng hộ</div>
                      </div>
                    </>
                  )}
                  {isBacker && (
                    <>
                      <div>
                        <div className="text-2xl font-black text-purple-600">{user._count.pledges}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Đã ủng hộ</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-pink-600">{formatVND(totalSupported)}</div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Tổng đóng góp</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <ProfileTabs
          userId={userId}
          isOwnProfile={isOwnProfile}
          showAsPublic={showAsPublic}
          campaigns={serializedCampaigns}
          blogPosts={user.blog_posts}
          pledges={serializedPledges}
          projects={serializedProjects}
          isCreator={isCreator}
          isBacker={isBacker}
          profileConfig={profileConfig}
          badgeCount={badgeCount}
        />

        {isLayoutSectionVisible(profileConfig, "analytics", audience) && (profileConfig.analytics.showSupportStats || profileConfig.analytics.showProgressStats) && (
          <section className="grid gap-4 sm:grid-cols-2">
            {profileConfig.analytics.showProgressStats && isCreator && (
              <div className="border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-6 shadow-sm" style={{ borderRadius: "var(--profile-card-radius)" }}>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--profile-muted)]">Tổng huy động</div>
                <div className="mt-2 text-3xl font-black text-[var(--profile-primary)]">{formatVND(totalRaised)}</div>
                <div className="mt-1 text-sm text-[var(--profile-muted)]">{successfulCampaigns} chiến dịch đã thành công</div>
              </div>
            )}
            {profileConfig.analytics.showSupportStats && isBacker && (
              <div className="border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-6 shadow-sm" style={{ borderRadius: "var(--profile-card-radius)" }}>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--profile-muted)]">Hoạt động ủng hộ</div>
                <div className="mt-2 text-3xl font-black text-[var(--profile-secondary)]">{formatVND(totalSupported)}</div>
                <div className="mt-1 text-sm text-[var(--profile-muted)]">{user._count.pledges} lượt ủng hộ</div>
              </div>
            )}
          </section>
        )}

        {isLayoutSectionVisible(profileConfig, "achievements", audience) && (isCreator || isBacker) && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">Thành tích</h3>
            <div className="space-y-3">
              {isCreator && successfulCampaigns > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Award size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{successfulCampaigns} dự án thành công</div>
                    <div className="text-xs text-gray-400">Creator xuất sắc</div>
                  </div>
                </div>
              )}
              {isBacker && user._count.pledges >= 5 && (
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <Heart size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Người ủng hộ tích cực</div>
                    <div className="text-xs text-gray-400">{user._count.pledges} đóng góp</div>
                  </div>
                </div>
              )}
              {totalRaised >= 10000000 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Huy động 10M+</div>
                    <div className="text-xs text-gray-400">Milestone đạt được</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
