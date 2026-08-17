import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Clock, CheckCircle2, Search, ArrowRight } from "lucide-react";

export default async function BackerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const pledges = await prisma.pledges.findMany({
    where: { userId: (session.user as any).id },
    include: {
      campaigns: { select: { title: true, slug: true, status: true, imageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSupported = pledges.filter(p => p.status === "SUCCESS").reduce((acc, p) => acc + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6 mt-10">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Hoạt động của bạn</div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Dashboard Backer</h1>
          </div>
          <div className="bg-white px-8 py-6 rounded-[2rem] border border-gray-100 shadow-soft flex items-center gap-6">
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng ủng hộ</div>
              <div className="text-2xl font-black text-blue-600">{formatVND(totalSupported)}</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Heart size={24} fill="currentColor" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">Chiến dịch đã đồng hành ({pledges.length})</h2>

          {pledges.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pledges.map((pledge: any) => (
                <div key={pledge.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-soft hover:shadow-premium transition-all group">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0">
                      <img src={pledge.campaign.imageUrl || "/placeholder.jpg"} className="w-full h-full object-cover" alt="Campaign" />
                    </div>

                    <div className="flex-grow space-y-2 text-center md:text-left">
                      <Link href={`/campaigns/${pledge.campaign.slug}`} className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition tracking-tight block">
                        {pledge.campaign.title}
                      </Link>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                        <span className="text-sm font-bold text-gray-900">{formatVND(Number(pledge.amount))}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1">
                          <Clock size={12} /> {formatDate(pledge.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${pledge.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                        }`}>
                        {pledge.status === "SUCCESS" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {pledge.status === "SUCCESS" ? "Thành công" : "Chờ xử lý"}
                      </span>
                      <Link href={`/campaigns/${pledge.campaign.slug}`} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-900 hover:text-white transition active:scale-90">
                        <ArrowRight size={20} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center glass-morphism rounded-[3rem]">
              <Search className="mx-auto text-gray-200 mb-6" size={56} />
              <h3 className="text-xl font-black text-gray-900 mb-2">Bạn chưa ủng hộ chiến dịch nào</h3>
              <p className="text-gray-400 text-sm font-medium mb-8">Hãy khám phá những chiến dịch đầy cảm hứng và bắt đầu hành trình của bạn.</p>
              <Link href="/campaigns" className="btn-primary">Khám phá chiến dịch ngay</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
