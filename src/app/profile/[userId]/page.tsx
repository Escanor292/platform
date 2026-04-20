import { prisma } from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Heart, Rocket, Award, TrendingUp, Settings, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import UserIdDisplay from "@/components/profile/UserIdDisplay";
import SocialLinks from "@/components/profile/SocialLinks";
import { SocialLink } from "@/types/social";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const session = await auth();
  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = currentUserId === userId;

  // Lấy thông tin user
  const user = await prisma.user.findUnique({
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
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
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

  // Tính toán thống kê
  const totalRaised = user.campaigns.reduce((sum, c) => sum + Number(c.currentAmount), 0);
  const totalBackers = user.campaigns.reduce((sum, c) => sum + c._count.pledges, 0);
  const totalSupported = user.pledges.reduce((sum, p) => sum + Number(p.amount), 0);
  const successfulCampaigns = user.campaigns.filter(c => c.status === "SUCCESS").length;

  const isCreator = user.role === "CREATOR";
  const isBacker = user._count.pledges > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Profile Header */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
            )}
          </div>

          {/* Content Area with White Background */}
          <div className="relative px-8 pt-20 pb-8">
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
            {isOwnProfile && (
              <div className="absolute top-6 right-8 flex gap-2">
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

            {/* User Info - In White Content Area */}
            <div className="space-y-4">
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

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Tham gia {new Date(user.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
                </div>
                {user.location && (
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
              {user.bio && (
                <p className="text-gray-600 max-w-3xl leading-relaxed">{user.bio}</p>
              )}

              {/* Social Links */}
              {user.socialLinks && Array.isArray(user.socialLinks) && (user.socialLinks as SocialLink[]).length > 0 && (
                <div className="pt-2">
                  <SocialLinks links={user.socialLinks as SocialLink[]} size="md" />
                </div>
              )}

              {/* Stats */}
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
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Created Campaigns */}
            {isCreator && user.campaigns.length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Rocket size={24} className="text-blue-600" />
                  Dự án đã tạo ({user.campaigns.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.campaigns.map((campaign) => {
                    const progress = Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100));
                    return (
                      <Link
                        key={campaign.id}
                        href={`/campaigns/${campaign.slug}`}
                        className="group"
                      >
                        <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={campaign.imageUrl || "/placeholder.jpg"}
                              alt={campaign.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3">
                              <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${campaign.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                                }`}>
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                              {campaign.title}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-blue-600">{progress}%</span>
                                <span className="text-gray-900">{formatVND(Number(campaign.currentAmount))}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-full rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold">
                                {campaign._count.pledges} người ủng hộ
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Supported Campaigns */}
            {isBacker && user.pledges.length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <Heart size={24} className="text-pink-600" />
                  Đã ủng hộ ({user.pledges.length})
                </h2>
                <div className="space-y-4">
                  {user.pledges.map((pledge) => (
                    <Link
                      key={pledge.id}
                      href={`/campaigns/${pledge.campaign.slug}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition group"
                    >
                      <img
                        src={pledge.campaign.imageUrl || "/placeholder.jpg"}
                        alt={pledge.campaign.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition">
                          {pledge.campaign.title}
                        </h3>
                        <div className="text-xs text-gray-400">
                          {new Date(pledge.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-pink-600">
                          {formatVND(Number(pledge.amount))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isCreator && !isBacker && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
                <div className="text-gray-300 mb-4">
                  <TrendingUp size={64} className="mx-auto" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Chưa có hoạt động
                </h3>
                <p className="text-gray-400">
                  Người dùng này chưa tạo dự án hoặc ủng hộ chiến dịch nào.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            {(isCreator || isBacker) && (
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
      </div>
    </div>
  );
}
