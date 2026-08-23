import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Sparkles } from 'lucide-react';
import ProfileCustomizationEditor from '@/components/profile/ProfileCustomizationEditor';

interface CustomizeProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function CustomizeProfilePage({ params }: CustomizeProfilePageProps) {
  const { userId } = await params;
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  const sessionUserId = session.user.id ?? (session.user.email
    ? (await prisma.users.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
    : undefined);

  if (!sessionUserId || sessionUserId !== userId) redirect(`/profile/${userId}`);

  const user = await prisma.users.findUnique({ where: { id: userId }, select: { id: true, name: true } });
  if (!user) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href={`/profile/${userId}`} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-teal-700">
              <ArrowLeft size={16} /> Quay về trang cá nhân
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700"><Sparkles size={24} /></div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Tùy chỉnh trang cá nhân</h1>
                <p className="mt-1 text-sm text-slate-500">Thiết kế không gian riêng cho {user.name || 'bạn'}, phù hợp cá tính hoặc dự án.</p>
              </div>
            </div>
          </div>
          <Link href={`/profile/${userId}?preview=public`} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700">
            <Eye size={17} /> Xem bản public
          </Link>
        </div>
        <ProfileCustomizationEditor />
      </div>
    </main>
  );
}
