import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { MapPin, Share2, Heart, ShieldCheck } from "lucide-react";
import PledgeForm from "@/components/campaign/PledgeForm";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CampaignDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      creator: { select: { name: true, image: true, username: true } },
      rewards: { orderBy: { amount: "asc" } },
      _count: { select: { pledges: true } }
    },
  });

  if (!campaign) notFound();

  const progress = Math.min(100, Math.round((campaign.currentAmount / campaign.goalAmount) * 100) || 0);
  const daysLeft = campaign.endDate ? Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="flex flex-col w-full pb-32 md:pb-12 text-gray-900 bg-white">
      {/* Hero Section */}
      <section className="relative h-72 md:h-96 w-full">
        <img 
          src={campaign.imageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"} 
          className="w-full h-full object-cover"
          alt={campaign.title || ""}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
           <Link href="/campaigns" className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 shadow-sm active:scale-90 transition">
              <ArrowLeft size={20} />
           </Link>
           <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-gray-900 shadow-sm active:scale-90 transition">
              <Share2 size={20} />
           </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-6 -mt-16 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                Dự án nổi bật ★
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                {campaign.title}
              </h1>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed font-medium">
                {campaign.tagline}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 py-8 border-t border-gray-100">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                       {campaign.creator.image ? <img src={campaign.creator.image} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div>
                       <div className="text-[10px] text-gray-400 font-black uppercase mb-0.5">Sáng tạo bởi</div>
                       <div className="font-bold text-gray-900">{campaign.creator.name}</div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                       <MapPin size={14} className="text-green-500" />
                       Hà Nội, Việt Nam
                    </div>
                 </div>
              </div>
           </div>

           <div className="md:hidden bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 space-y-6">
              <div className="flex justify-between items-end">
                 <div>
                    <div className="text-3xl font-black text-green-600 mb-1">{formatVND(campaign.currentAmount)}</div>
                    <div className="text-xs text-gray-400 font-medium tracking-tight uppercase">đã huy động được</div>
                 </div>
                 <div className="text-right">
                    <div className="text-lg font-black text-gray-900 mb-1">{campaign._count.pledges}</div>
                    <div className="text-xs text-gray-400 font-medium tracking-tight uppercase">người ủng hộ</div>
                 </div>
              </div>
              
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              
              <div className="flex justify-between items-center text-xs font-black uppercase text-gray-400">
                 <span>Tiến độ: {progress}%</span>
                 <span>Còn {daysLeft} ngày</span>
              </div>
           </div>

           <div className="space-y-8">
              <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar gap-8">
                 <button className="pb-4 border-b-4 border-green-600 font-black text-gray-900 uppercase tracking-widest text-xs">Câu chuyện</button>
                 <button className="pb-4 border-b-4 border-transparent font-bold text-gray-400 uppercase tracking-widest text-xs">Cập nhật (0)</button>
                 <button className="pb-4 border-b-4 border-transparent font-bold text-gray-400 uppercase tracking-widest text-xs">Bình luận</button>
              </div>
              
              <article className="prose prose-green max-w-none text-gray-600 leading-[1.8]">
                 <p className="text-lg font-medium mb-6">Xin chào các bạn, đây là dự án tâm huyết của chúng mình...</p>
                 <p>{campaign.description}</p>
              </article>
           </div>
        </div>

        <div className="space-y-8">
           <div className="hidden md:block bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
              <div className="mb-8">
                 <div className="text-4xl font-black text-green-600 tracking-tighter mb-2">{formatVND(campaign.currentAmount)}</div>
                 <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Đã gọi được {formatVND(campaign.goalAmount)}</div>
              </div>
              
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-8 mb-8">
                 <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-xl font-black text-gray-900">{campaign._count.pledges}</div>
                    <div className="text-[10px] text-gray-400 font-black uppercase">Người ủng hộ</div>
                 </div>
                 <div className="text-center p-4 bg-gray-50 rounded-2xl">
                    <div className="text-xl font-black text-gray-900">{daysLeft}</div>
                    <div className="text-[10px] text-gray-400 font-black uppercase">Ngày còn lại</div>
                 </div>
              </div>
              
              <PledgeForm campaignId={campaign.id} rewards={campaign.rewards as any} />
           </div>

           <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 p-4 pt-8 bg-gradient-to-t from-white via-white to-transparent">
              <PledgeForm campaignId={campaign.id} rewards={campaign.rewards as any} />
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-black text-gray-900 px-2 flex items-center gap-2">
                 <Heart size={20} className="text-red-500" />
                 Gói quà tặng
              </h3>
              <div className="grid grid-cols-1 gap-4">
                 {campaign.rewards.map(r => (
                   <div key={r.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-lg transition group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="text-lg font-black text-gray-900 line-clamp-2">{r.title}</div>
                         <div className="px-3 py-1 bg-green-50 text-green-600 font-black text-xs rounded-full">{formatVND(r.amount)}</div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-3">{r.description}</p>
                      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                         Dự kiến: {r.estimatedDelivery || "N/A"}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-gray-50 rounded-[2rem] p-8 mt-12">
              <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                 <ShieldCheck size={20} className="text-green-600" />
                 Đảm bảo tin cậy
              </h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                 Crowdfunding VN không đảm bảo kết quả cuối cùng. Xem thêm <Link href="/policy/refund" className="text-green-600 hover:underline">Chính sách hoàn tiền</Link>.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeft({ size }: { size: number }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
