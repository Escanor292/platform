import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
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
  const dbUser = await prisma.user.findUnique({
    where: { email: currentUser.email },
    select: { id: true }
  });

  // Chỉ cho phép chỉnh sửa profile của chính mình
  if (!dbUser || dbUser.id !== userId) {
    redirect(`/profile/${userId}`);
  }

  // Lấy thông tin user để edit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      coverImage: true,
      bio: true,
      location: true,
      website: true,
      phone: true,
      shippingAddress: true,
      socialLinks: true
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Chỉnh sửa trang cá nhân</h1>
          <p className="text-gray-400">Cập nhật thông tin của bạn</p>
        </div>

        <ProfileEditForm user={user} />
      </div>
    </div>
  );
}
