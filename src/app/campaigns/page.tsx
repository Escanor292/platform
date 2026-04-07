import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { Search, Rocket, Sparkles, Filter, Zap } from "lucide-react";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      creator: { select: { name: true, avatar: true, isPro: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Search Header */}
      <section className="bg-white border-b border-gray-100 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-grow space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">Khám phá <span className="text-gradient">ý tưởng</span></h1>
            <p className="text-lg text-gray-400 font-medium">Tìm kiếm những dự án thay đổi tương lai và bắt đầu hành trợ của bạn.</p>
          </div>
          
          <div className="w-full max-w-md space-y-4">
             <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition" size={24} />
                <input 
                  type="text" 
                  placeholder="Tìm tên dự án, chủ đề..." 
                  className="w-full h-20 pl-16 pr-8 bg-gray-50 border-0 rounded-[2rem] focus:ring-2 focus:ring-blue-600 font-bold text-gray-900 placeholder:text-gray-400 transition-all shadow-soft"
                />
             </div>
             <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">Tất cả</button>
                <button className="px-4 py-2 bg-white text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:border-blue-600 hover:text-blue-600 transition whitespace-nowrap">Công nghệ</button>
                <button className="px-4 py-2 bg-white text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:border-blue-600 hover:text-blue-600 transition whitespace-nowrap">Môi trường</button>
                <button className="px-4 py-2 bg-white text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 hover:border-blue-600 hover:text-blue-600 transition whitespace-nowrap">Giáo dục</button>
             </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {campaigns.length > 0 ? (
            campaigns.map((campaign: any) => {
               const progress = Math.min(100, Math.round((Number(campaign.currentAmount) / Number(campaign.goalAmount)) * 100));
               return (
                <div key={campaign.id} className="card-premium group">
                  {campaign.imageUrl && (
                    <div className="relative h-64 overflow-hidden">
                      <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4">
                         <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black text-gray-900 uppercase tracking-widest rounded-lg border border-white/20">
                           {campaign.category || "HÀNH ĐỘNG"}
                         </span>
                      </div>
                    </div>
                  )}
                  <div className="p-8 flex flex-col h-full">
                    <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition tracking-tight">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                      {campaign.description}
                    </p>
                    
                    <div className="mt-auto space-y-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-end text-sm font-black text-gray-900">
                            <span>{progress}% <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-1 font-bold">đã đạt được</span></span>
                            <span>{formatVND(Number(campaign.currentAmount))}</span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                              style={{ width: `${progress}%` }}
                            />
                         </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-black uppercase">
                                {campaign.creator?.name?.slice(0, 1) || "C"}
                             </div>
                             <div className="text-[11px] font-black text-gray-900 uppercase truncate max-w-[100px]">
                                {campaign.creator?.name || "Anonymous"}
                                {campaign.creator?.isPro && <Sparkles size={8} className="inline ml-1 text-emerald-500" />}
                             </div>
                          </div>
                          
                          <Link href={`/campaigns/${campaign.slug}`} className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition active:scale-90">
                             <Zap size={18} fill="currentColor" />
                          </Link>
                      </div>
                    </div>
                  </div>
                </div>
               );
            })
          ) : (
            <div className="col-span-full py-24 text-center glass-morphism rounded-[3rem]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Rocket className="text-gray-300" size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Chưa có dự án nào...</h3>
              <p className="text-gray-400 text-sm font-medium">Hiện tại chưa có chiến dịch nào đang hoạt động. Hãy quay lại sau nhé!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
