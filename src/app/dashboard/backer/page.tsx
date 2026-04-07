import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatVND } from "@/lib/utils";
import { Heart, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function BackerDashboard() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const pledges = await prisma.pledge.findMany({
    where: { userId: user.id },
    include: { campaign: true, payment: true },
    orderBy: { createdAt: "desc" }
  });

  const totalFunded = pledges
    .filter(p => p.payment?.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
           <div className="text-xs font-black text-green-600 uppercase tracking-widest mb-2">Backer Dashboard</div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">Chào {user.name?.split(' ')[0]}! 👋</h1>
           <p className="text-gray-500 mt-2 font-medium">Bạn đã đóng góp công sức cho {pledges.length} dự án sáng tạo.</p>
        </div>
        
        <div className="bg-gray-900 text-white p-6 rounded-[2rem] flex items-center gap-6 shadow-xl w-full md:w-auto">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Heart fill="currentColor" className="text-green-500" />
           </div>
           <div>
              <div className="text-[10px] font-black uppercase text-gray-400">Tổng đã ủng hộ</div>
              <div className="text-2xl font-black">{formatVND(totalFunded)}</div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-black text-gray-900 mb-2">Lịch sử đồng hành</h2>
        
        {pledges.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🌱</div>
             <p className="text-gray-400 font-bold mb-6">Bạn chưa tham gia ủng hộ dự án nào.</p>
             <Link href="/campaigns" className="px-8 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition">
               Khám phá ngay
             </Link>
          </div>
        ) : (
          pledges.map(p => (
            <div key={p.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                     <img src={p.campaign.imageUrl || "/images/default-campaign.jpg"} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <div className="text-[10px] font-black text-green-600 uppercase mb-1">{p.campaign.category || "Hỗ trợ"}</div>
                     <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{p.campaign.title}</h3>
                     <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                        <Clock size={14} />
                        Ngày: {p.createdAt.toLocaleDateString('vi-VN')}
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-row md:flex-col justify-between items-end w-full md:w-40 gap-2">
                  <div className="text-lg font-black text-gray-900">{formatVND(p.amount)}</div>
                  {p.payment?.status === "SUCCESS" ? (
                    <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full flex items-center gap-1 uppercase">
                       <CheckCircle2 size={12} /> Thành công
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full flex items-center gap-1 uppercase">
                       <CreditCard size={12} /> Chờ TT
                    </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
