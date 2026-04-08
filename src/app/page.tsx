import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { Rocket, Sparkles, TrendingUp, ShieldCheck, Zap, Globe } from "lucide-react";

export default async function Home() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      creator: { select: { name: true, avatar: true, isPro: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-grid">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm mb-8">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Nền tảng gọi vốn số 1 Việt Nam</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[1.1]">
            Khơi nguồn <span className="text-gradient">sáng tạo</span>,<br />
            Lan tỏa <span className="text-gradient">yêu thương</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-500 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Nơi những ý tưởng táo bạo nhất được cộng đồng chung tay xây dựng. Hãy bước ra ánh sáng và bắt đầu chiến dịch của riêng bạn hôm nay.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/campaigns" className="btn-primary flex items-center gap-2 group">
              <Rocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={20} />
              Khám phá dự án
            </Link>
            <Link href="/campaigns/create" className="btn-outline flex items-center gap-2">
              <PlusIcon size={20} />
              Bắt đầu chiến dịch
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center items-center gap-6 md:gap-12">
             <Link href="/policy" className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100/50 hover:bg-white hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95 group/pill">
               <TrendingUp size={20} className="text-blue-600 group-hover/pill:scale-110 transition-transform"/> 
               <span className="font-extrabold text-gray-900 group-hover/pill:text-blue-600 transition-colors">Viral</span>
             </Link>
             <Link href="/policy" className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100/50 hover:bg-white hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95 group/pill">
               <ShieldCheck size={20} className="text-emerald-500 group-hover/pill:scale-110 transition-transform"/> 
               <span className="font-extrabold text-gray-900 group-hover/pill:text-emerald-500 transition-colors">Tin cậy</span>
             </Link>
             <Link href="/policy" className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100/50 hover:bg-white hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-95 group/pill">
               <Globe size={20} className="text-blue-600 group-hover/pill:scale-110 transition-transform"/> 
               <span className="font-extrabold text-gray-900 group-hover/pill:text-blue-600 transition-colors">Sứ mệnh</span>
             </Link>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div>
            <div className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Dự án cộng đồng</div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Dự án chọn lọc</h2>
          </div>
          <Link href="/campaigns" className="text-sm font-black text-blue-600 border-b-2 border-blue-600 hover:text-blue-800 transition">
            Xem tất cả dự án →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
                             <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-black uppercase">
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
              <h3 className="text-xl font-black text-gray-900 mb-2">Đang chờ dự án mới...</h3>
              <p className="text-gray-400 text-sm font-medium">Hiện tại không có dự án nào đang hoạt động. Hãy là người đầu tiên!</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
               <div className="text-xs font-black text-emerald-500 uppercase tracking-widest">Tiêu chuẩn an toàn</div>
               <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-[0.9]">Cộng đồng tin cậy, Giao dịch minh bạch.</h2>
               <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  Chúng tôi vận hành với cơ chế Smart Contract (giả lập) và quy trình đối soát chặt chẽ. Tiền của bạn chỉ được giải ngân khi dự án đạt mục tiêu.
               </p>
               <Link href="/policy" className="btn-primary inline-flex mt-4 w-max">Tìm hiểu thêm về CFVN</Link>
            </div>
            <div className="flex-1 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
               <div className="grid grid-cols-2 gap-4 relative">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col gap-4">
                     <ShieldCheck size={32} className="text-emerald-500" />
                     <div className="text-sm font-bold text-gray-900">Bảo mật tuyệt đối</div>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col gap-4 mt-8">
                     <Zap size={32} className="text-blue-600" />
                     <div className="text-sm font-bold text-gray-900">Giải ngân nhanh</div>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
