import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatVND, formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Rocket, Users, Target, Activity, Zap, ArrowRight, Settings } from "lucide-react";

export default async function CreatorDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const campaigns = await prisma.campaign.findMany({
    where: { creatorId: (session.user as any).id },
    include: { _count: { select: { pledges: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totalRaised = campaigns.reduce((acc, c) => acc + Number(c.currentAmount), 0);
  const totalBackers = campaigns.reduce((acc, c) => acc + c._count.pledges, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6 mt-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 animate-fade-in-up">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                 <Zap size={12} fill="currentColor" /> Chế độ Creator Pro
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">Dự án của tôi</h1>
              <p className="text-lg text-gray-400 font-medium">Theo dõi và quản lý hành trình sáng tạo của bạn.</p>
           </div>
           
           <Link href="/campaigns/create" className="h-20 px-10 bg-blue-600 text-white font-black rounded-3xl hover:bg-black transition flex items-center gap-3 shadow-xl active:scale-95">
              <Plus size={24} />
              Bắt đầu dự án mới
           </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-[1.8rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                 <Target size={32} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng huy động</div>
                 <div className="text-2xl font-black text-gray-900">{formatVND(totalRaised)}</div>
              </div>
           </div>
           
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-16 h-16 bg-emerald-50 rounded-[1.8rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                 <Users size={32} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Người ủng hộ</div>
                 <div className="text-2xl font-black text-gray-900">{totalBackers} Backers</div>
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-soft flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-16 h-16 bg-orange-50 rounded-[1.8rem] flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500">
                 <Activity size={32} />
              </div>
              <div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dự án đang chạy</div>
                 <div className="text-2xl font-black text-gray-900">{campaigns.filter(c => c.status === "ACTIVE").length} / {campaigns.length}</div>
              </div>
           </div>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-10">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-4">Danh sách dự án ({campaigns.length})</h2>
          
          {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {campaigns.map((campaign: any) => {
                 const progress = Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100));
                 return (
                  <div key={campaign.id} className="bg-white rounded-[3rem] border border-gray-100 shadow-soft overflow-hidden group hover:shadow-premium transition-all">
                    <div className="relative h-48 overflow-hidden">
                       <img src={campaign.imageUrl || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Campaign" />
                       <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 bg-white/90 backdrop-blur text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20 ${
                            campaign.status === "ACTIVE" ? "text-blue-600" : "text-gray-400"
                          }`}>
                            {campaign.status}
                          </span>
                       </div>
                    </div>
                    
                    <div className="p-8 space-y-6">
                       <div>
                          <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 truncate group-hover:text-blue-600 transition">{campaign.title}</h3>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2">{campaign.description}</p>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex justify-between items-end text-sm font-black">
                             <span className="text-blue-600">{progress}%</span>
                             <span className="text-gray-900">{formatVND(Number(campaign.currentAmount))}</span>
                          </div>
                          <div className="w-full bg-gray-50 rounded-full h-2 overflow-hidden border border-gray-100">
                             <div 
                               className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                               style={{ width: `${progress}%` }}
                             />
                          </div>
                          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                             <span>{campaign._count.pledges} Trái tim</span>
                             <span>Kết thúc: {campaign.endDate ? formatDate(campaign.endDate) : "Vô thời hạn"}</span>
                          </div>
                       </div>
                       
                       <div className="flex gap-3 pt-4">
                          <Link href={`/campaigns/${campaign.slug}`} className="flex-grow h-14 bg-gray-50 text-gray-900 font-black rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition active:scale-95 gap-2 uppercase tracking-tighter text-sm">
                             Xem dự án
                             <ArrowRight size={16} />
                          </Link>
                          <Link href={`/dashboard/creator/campaigns/${campaign.id}/edit`} className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-900 hover:text-white transition active:scale-95">
                             <Settings size={20} />
                          </Link>
                       </div>
                    </div>
                  </div>
                 );
              })}
            </div>
          ) : (
            <div className="py-32 text-center glass-morphism rounded-[3rem]">
              <Rocket className="mx-auto text-gray-200 mb-6" size={64} />
              <h3 className="text-2xl font-black text-gray-900 mb-2">Thế giới đang chờ đợi ý tưởng của bạn</h3>
              <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">Chưa có dự án nào được khởi tạo. Hãy cùng nhau bắt đầu hành trình thay đổi thế giới ngay!</p>
              <Link href="/campaigns/create" className="h-16 px-12 bg-blue-600 text-white font-black rounded-2xl hover:bg-black transition inline-flex items-center gap-2 shadow-xl active:scale-95">
                 <Plus size={20} />
                 Bắt đầu ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
