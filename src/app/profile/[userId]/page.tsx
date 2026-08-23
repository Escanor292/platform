import { prisma } from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Heart, Rocket, Award, TrendingUp, Settings, ShieldCheck, Tag, Layers, MessageCircle, Eye, EyeOff } from "lucide-react";
import { auth } from "@/lib/auth";
import UserIdDisplay from "@/components/profile/UserIdDisplay";
import SocialLinks from "@/components/profile/SocialLinks";
import { SocialLink } from "@/types/social";
import { CampaignGrowthProgress } from "@/components/campaign/CampaignGrowthProgress";
import { getCampaignTypeLabel } from "@/lib/campaign-helpers";
import { UserBadgeList } from "@/components/badge/UserBadgeList";
import { StartChatButton } from "@/components/chat/StartChatButton";
import { ProfileBlogCard } from "@/components/profile/ProfileBlogCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { canExposePrivacyField } from "@/lib/profile-settings";
import { getProfileThemeStyle, getPublicProfileCustomization, isSectionVisible, normalizeProfileCustomization } from "@/lib/profile-customization";

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

  // Lấy thông tin user
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
            ? {} // Owner: tất cả trạng thái
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
  const profileConfig = profileIsPublic ? getPublicProfileCustomization(storedProfileConfig, userId) : storedProfileConfig;
  const showLocation = canExposePrivacyField(user.role, user.privacySettings, 'location', !profileIsPublic);
  const showBio = canExposePrivacyField(user.role, user.privacySettings, 'bio', !profileIsPublic);
  const showWebsite = canExposePrivacyField(user.role, user.privacySettings, 'website', !profileIsPublic);
  const showSocialLinks = canExposePrivacyField(user.role, user.privacySettings, 'socialLinks', !profileIsPublic);
  const showEmail = canExposePrivacyField(user.role, user.privacySettings, 'email', !profileIsPublic);
  const showPhone = canExposePrivacyField(user.role, user.privacySettings, 'phone', !profileIsPublic);

  // Serialize data cho Client Component (convert Decimal to number/string)
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

  // Serialize projects with campaigns and rewards
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

  // Tính toán thống kê
  const totalRaised = user.campaigns.reduce((sum, c) => sum + Number(c.currentAmount), 0);
  const totalBackers = user.campaigns.reduce((sum, c) => sum + c._count.pledges, 0);
  const totalSupported = user.pledges.reduce((sum, p) => sum + Number(p.amount), 0);
  const successfulCampaigns = user.campaigns.filter(c => c.status === "SUCCESS").length;

  const isCreator = user.role === "CREATOR";
  const isBacker = user._count.pledges > 0;

  return (
    <div className="min-h-screen py-24 px-6" style={{ ...getProfileThemeStyle(profileConfig), backgroundColor: "var(--profile-background)" }}>
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Profile Header */}
        <div className="overflow-hidden border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] shadow-sm" style={{ borderRadius: "var(--profile-radius)" }}>
          {/* Cover Image */}
          <div className="relative h-64" style={{ background: "var(--profile-gradient)" }}>
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0" style={{ background: "var(--profile-gradient)" }} />
            )}
          </div>

          {/* Content Area with White Background */}
          <div className="relative px-8 pb-8 pt-20">
            {/* Avatar - Overlapping Cover */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-[2rem] bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-white bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()
                )}
              </div>
            </div>

            {/* Edit Button - Top Right */}
            {isOwnProfile && !showAsPublic && (
              <div className="absolute top-6 right-8 flex gap-2">
                {/* Preview Toggle - Only show in owner mode */}
                <Link
                  href={`/profile/${userId}?preview=public`}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm font-bold transition flex items-center gap-2"
                  title="Xem giao diện công khai"
                >
                  <Eye size={16} />
                  Chế độ xem
                </Link>

                <Link
                  href={`/profile/${userId}/edit`}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Settings size={16} />
                  Chỉnh sửa
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/dashboard/admin"
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    Quản trị
                  </Link>
                )}
                {(user.role === "CREATOR") && (
                  <Link
                    href="/dashboard/creator"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Rocket size={16} />
                    Quản lý dự án
                  </Link>
                )}
              </div>
            )}

            {/* Preview Mode - Return to Owner View Button */}
            {isOwnProfile && showAsPublic && (
              <div className="absolute top-20 right-8">
                <Link
                  href={`/profile/${userId}`}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg"
                  title="Quay về chế độ chủ sở hữu"
                >
                  <EyeOff size={16} />
                  Chế độ khách
                </Link>
              </div>
            )}

            {/* Message Button - For other users OR Preview Mode */}
            {(!isOwnProfile || showAsPublic) && currentUserId && (
              <div className="absolute top-6 right-8">
                <StartChatButton
                  campaignOwnerId={userId}
                  campaignOwnerName={user.name || "Người dùng"}
                  variant="none"
                  label="Nhắn tin"
                  className="bg-gradient-to-r from-pgreen to-fgreen text-white rounded-xl text-sm font-bold hover:shadow-lg transition"
                />
              </div>
            )}

            {/* User Info - In White Content Area */}
            <div className="space-y-4">
              {/* Identity is always visible; optional about fields obey the profile layout. */}
              {/* Name and Badges */}
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-gray-900">
                  {user.name || "Người dùng ẩn danh"}
                </h1>
                {user.status === "PRO" && (
                  <div className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-black uppercase flex items-center gap-1">
                    <Award size={12} />
                    Pro
                  </div>
                )}
                {user.role === "ADMIN" && (
                  <div className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black uppercase">
                    Admin
                  </div>
                )}
              </div>

              {isSectionVisible(profileConfig, "about") && (
                <>
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--profile-muted)]">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Tham gia {new Date(user.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                </div>
                {user.location && showLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {user.location}
                  </div>
                )}
              </div>

              {/* User ID */}
              <div>
                <UserIdDisplay userId={user.id} />
              </div>

              {/* Bio */}
              {user.bio && showBio && (
                <p className="text-gray-600 max-w-3xl leading-relaxed">{user.bio}</p>
              )}

              {/* Social Links */}
              {user.socialLinks && showSocialLinks && Array.isArray(user.socialLinks) && (user.socialLinks as SocialLink[]).length > 0 && (
                <div className="pt-2">
                  <SocialLinks links={user.socialLinks as SocialLink[]} size="md" />
                </div>
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

              {/* Stats */}
              {isSectionVisible(profileConfig, "analytics") && (
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


        {/* Profile Tabs */}
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
        />

        {isSectionVisible(profileConfig, "analytics") && (profileConfig.analytics.showSupportStats || profileConfig.analytics.showProgressStats) && (
          <section className="grid gap-4 sm:grid-cols-2">
            {profileConfig.analytics.showProgressStats && isCreator && (
              <div className="border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-6 shadow-sm" style={{ borderRadius: "var(--profile-radius)" }}>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--profile-muted)]">Tổng huy động</div>
                <div className="mt-2 text-3xl font-black text-[var(--profile-primary)]">{formatVND(totalRaised)}</div>
                <div className="mt-1 text-sm text-[var(--profile-muted)]">{successfulCampaigns} chiến dịch đã thành công</div>
              </div>
            )}
            {profileConfig.analytics.showSupportStats && isBacker && (
              <div className="border border-[color:var(--profile-primary)]/10 bg-[var(--profile-surface)] p-6 shadow-sm" style={{ borderRadius: "var(--profile-radius)" }}>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--profile-muted)]">Hoạt động ủng hộ</div>
                <div className="mt-2 text-3xl font-black text-[var(--profile-secondary)]">{formatVND(totalSupported)}</div>
                <div className="mt-1 text-sm text-[var(--profile-muted)]">{user._count.pledges} lượt ủng hộ</div>
              </div>
            )}
          </section>
        )}

        {isSectionVisible(profileConfig, "cta") && profileConfig.cta.enabled && (
          <section className="flex flex-wrap items-center justify-between gap-4 p-6 text-white shadow-xl" style={{ borderRadius: "var(--profile-radius)", background: "var(--profile-gradient)" }}>
            <div>
              <div className="text-xl font-black">{profileConfig.cta.label}</div>
              <div className="mt-1 text-sm text-white/80">Khám phá thêm nội dung và hoạt động của {user.name || "người dùng"}.</div>
            </div>
            <Link
              href={profileConfig.cta.action === "projects" ? `/projects?creatorId=${encodeURIComponent(userId)}` : profileConfig.cta.action === "campaigns" ? `/campaigns?creatorId=${encodeURIComponent(userId)}` : profileConfig.cta.action === "products" ? `/profile/${encodeURIComponent(userId)}?tab=products` : profileConfig.cta.action === "blog" ? `/blog?authorId=${encodeURIComponent(userId)}` : `/chat?userId=${encodeURIComponent(userId)}`}
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-[var(--profile-primary)] shadow-lg transition hover:-translate-y-0.5"
            >
              Mở nội dung
            </Link>
          </section>
        )}

        {/* Sidebar - Achievements */}
        {isSectionVisible(profileConfig, "achievements") && (isCreator || isBacker) && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-black text-gray-900 mb-4">Thành tích</h3>
            <div className="space-y-3">
              {isCreator && successfulCampaigns > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Award size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {successfulCampaigns} dự án thành công
                    </div>
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
                    <div className="text-sm font-bold text-gray-900">
                      Người ủng hộ tích cực
                    </div>
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
                    <div className="text-sm font-bold text-gray-900">
                      Huy động 10M+
                    </div>
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
