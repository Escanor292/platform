import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Clock, Rocket, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UpgradeHubPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/upgrade");
  }

  const sessionUser = session.user as { id?: string; email?: string | null };
  const dbUser = sessionUser.id
    ? await prisma.users.findUnique({
        where: { id: sessionUser.id },
        select: {
          role: true,
          isOrganization: true,
          kyc_info: { select: { verificationStatus: true, rejectedReason: true, fullName: true } },
        },
      })
    : sessionUser.email
      ? await prisma.users.findUnique({
          where: { email: sessionUser.email },
          select: {
            role: true,
            isOrganization: true,
            kyc_info: { select: { verificationStatus: true, rejectedReason: true, fullName: true } },
          },
        })
      : null;

  const role = dbUser?.role || (session.user as { role?: string }).role || "BACKER";

  if (role === "CREATOR" || role === "ADMIN") {
    redirect("/dashboard/creator");
  }

  const pending = role === "CREATOR_PENDING";
  const kycStatus = dbUser?.kyc_info?.verificationStatus || null;
  const rejected = kycStatus === "REJECTED";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-pgreen">Tử Tế Fund</p>
          <h1 className="mt-3 font-display text-4xl font-black text-gray-900">Nâng cấp Creator</h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Backer cần hồ sơ pháp lý trước khi mở chiến dịch và xuất hóa đơn GTGT. Chọn cá nhân hoặc tổ chức.
          </p>
        </header>

        {pending ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <p className="flex items-center gap-2 font-bold">
              <Clock size={18} /> Hồ sơ đang chờ admin duyệt
            </p>
            <p className="mt-2 text-sm">
              Vai trò hiện tại: CREATOR_PENDING
              {kycStatus ? ` · KYC ${kycStatus}` : ""}.
              Bạn sẽ nhận quyền tạo chiến dịch sau khi được duyệt. Có thể bổ sung giấy tờ nếu admin yêu cầu.
            </p>
          </div>
        ) : null}

        {rejected ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
            <p className="font-bold">Hồ sơ KYC bị từ chối</p>
            <p className="mt-2 text-sm">{dbUser?.kyc_info?.rejectedReason || "Hãy nộp lại giấy tờ rõ hơn."}</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/upgrade/individual"
            className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition hover:border-pgreen hover:shadow-md"
          >
            <User className="text-pgreen" />
            <h2 className="mt-4 text-2xl font-black">Cá nhân / hộ</h2>
            <p className="mt-2 text-sm text-gray-600">
              CCCD hai mặt, địa chỉ, STK nhận chi hộ. MST hộ nếu đã đăng ký thuế — in lên hóa đơn GTGT khi bán quà.
            </p>
          </Link>
          <Link
            href="/upgrade/organization"
            className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm transition hover:border-pgreen hover:shadow-md"
          >
            <Building2 className="text-pgreen" />
            <h2 className="mt-4 text-2xl font-black">Tổ chức / công ty</h2>
            <p className="mt-2 text-sm text-gray-600">
              MST, giấy ĐKKD, người đại diện. Bắt buộc nếu xuất hóa đơn GTGT đứng tên pháp nhân.
            </p>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500">
          <Rocket className="mr-1 inline" size={14} />
          Sau khi duyệt, vào Dashboard Creator để mở chiến dịch. Nút Nâng cấp Creator luôn nằm trên thanh điều hướng khi bạn còn là Backer.
        </p>
      </div>
    </div>
  );
}
