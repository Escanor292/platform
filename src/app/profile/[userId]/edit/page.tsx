import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Palette } from "lucide-react";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

interface EditProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { userId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const currentUser = session.user as any;

  // Lấy user từ database
  const dbUser = await prisma.users.findUnique({
    where: { email: currentUser.email },
    select: { id: true }
  });

  // Chỉ cho phép chỉnh sửa profile của chính mình
  if (!dbUser || dbUser.id !== userId) {
    redirect(`/profile/${userId}`);
  }

  // Lấy thông tin user để edit
  const user = await prisma.users.findUnique({
    where: { id: userId }
  });

  if (!user) {
    notFound();
  }

  // Extract only needed fields for the form
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    coverImage: user.coverImage,
    bio: user.bio,
    location: user.location,
    website: user.website,
    phone: user.phone,
    shippingAddress: user.shippingAddress,
    socialLinks: user.socialLinks,
    role: user.role,
    privacySettings: user.privacySettings,
    notificationSettings: user.notificationSettings,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-white to-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-8 rounded-3xl border border-pgreen/10 bg-white/80 p-8 shadow-soft backdrop-blur">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pgreen/10 px-4 py-2 text-sm font-bold text-pgreen">
            Hồ sơ cá nhân
          </div>
          <h1 className="font-display text-4xl font-black text-dblue">
            Chỉnh sửa trang cá nhân
          </h1>
          <p className="mt-3 max-w-2xl text-gray-600">
            Cập nhật thông tin hiển thị để cộng đồng hiểu rõ hơn về bạn và hành trình bạn đang đồng hành.
          </p>
          <Link href={`/profile/${userId}/customize`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white transition hover:bg-teal-800">
            <Palette size={17} /> Tùy chỉnh giao diện trang cá nhân
          </Link>
        </div>

        <ProfileEditForm user={userData} />
      </div>
    </main>
  );
}
