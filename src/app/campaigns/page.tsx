import { prisma } from "@/lib/prisma";
import CampaignCard from "@/components/campaign/CampaignCard";
import { Search, Filter, Rocket } from "lucide-react";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    include: {
      creator: { select: { name: true } },
      _count: { select: { pledges: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100/50">
              <Rocket size={14} />
              Khám phá cộng đồng sáng tạo
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
              Biến ý tưởng thành <span className="text-green-600">hiện thực.</span>
           </h1>
           <p className="text-gray-400 font-medium max-w-xl text-lg">
             Hàng trăm dự án độc đáo đang chờ đợi sự đồng hành của bạn. 
             Hãy cùng nhau xây dựng tương lai!
           </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition" size={20} />
              <input 
                type="text" 
                placeholder="Tìm dự án..." 
                className="w-full pl-12 pr-6 py-4 bg-gray-100 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition transition-all"
              />
           </div>
           <button className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition active:scale-90 shadow-xl">
              <Filter size={24} />
           </button>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="py-32 text-center bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200">
           <div className="text-6xl mb-6">🔭</div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">Chưa có dự án nào đang chạy</h2>
           <p className="text-gray-400 font-medium">Quay lại sau để cập nhật những ý tưởng mới nhất bạn nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign as any} />
          ))}
        </div>
      )}
    </div>
  );
}
