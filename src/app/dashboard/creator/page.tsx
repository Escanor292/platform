import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatVND, calculateProgress } from "@/lib/utils";
import { Rocket, Users, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export default async function CreatorDashboard() {
  const user = await getUser();
  if (!user || user.role !== "CREATOR" && user.role !== "ADMIN") {
     // For demo, let's allow all loged users to see something or redirect to backer
     // redirect("/dashboard/backer"); 
  }

  const myCampaigns = await prisma.campaign.findMany({
    where: { creatorId: user?.id },
    include: { _count: { select: { pledges: true } } },
    orderBy: { createdAt: "desc" }
  });

  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalSupporters = myCampaigns.reduce((sum, c) => sum + c._count.pledges, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
           <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Creator Dashboard</div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">Cổng quản lý dự án 🚀</h1>
           <p className="text-gray-500 mt-2 font-medium">Theo dõi hiệu suất và tương tác với cộng đồng của bạn.</p>
        </div>
        
        <Link href="/campaigns/create" className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 shadow-xl shadow-green-500/20 active:scale-95 transition flex items-center gap-2">
           <Plus size={20} strokeWidth={3} />
           Tạo dự án mới
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <div className="p-8 bg-gray-900 text-white rounded-[2.5rem] shadow-xl">
            <TrendingUp className="text-green-500 mb-4" size={24} />
            <div className="text-[10px] font-black uppercase text-gray-400">Tổng vốn huy động</div>
            <div className="text-3xl font-black">{formatVND(totalRaised)}</div>
         </div>
         <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <Users className="text-blue-600 mb-4" size={24} />
            <div className="text-[10px] font-black uppercase text-gray-400">Cộng đồng của bạn</div>
            <div className="text-3xl font-black">{totalSupporters} người</div>
         </div>
         <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <Rocket className="text-amber-500 mb-4" size={24} />
            <div className="text-[10px] font-black uppercase text-gray-400">Dự án đang chạy</div>
            <div className="text-3xl font-black">{myCampaigns.length}</div>
         </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 mb-4 px-2">Dự án của tôi</h2>
        
        {myCampaigns.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">Bạn chưa tạo dự án nào.</p>
          </div>
        ) : (
          myCampaigns.map(c => {
            const progress = calculateProgress(c.currentAmount, c.goalAmount);
            return (
              <div key={c.id} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:shadow-lg transition">
                 <div className="w-32 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={c.imageUrl || "/images/default-campaign.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition" />
                 </div>
                 <div className="flex-1 space-y-3">
                    <h3 className="font-bold text-gray-900 text-xl">{c.title}</h3>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <span>{formatVND(c.currentAmount)} / {formatVND(c.goalAmount)}</span>
                       <span className="text-green-600">{progress}%</span>
                    </div>
                 </div>
                 <Link href={`/dashboard/creator/campaigns/${c.id}`} className="px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition">
                    Chi tiết →
                 </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
