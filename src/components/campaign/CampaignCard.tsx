"use client";

import Link from "next/link";
import { formatVND, calculateProgress, getDaysRemaining } from "@/lib/utils";
import { Users, Clock, ArrowUpRight } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    tagline?: string | null;
    goalAmount: number;
    currentAmount: number;
    imageUrl?: string | null;
    category?: string | null;
    endDate?: Date | string | null;
    creator?: { name: string | null } | null;
    _count?: { pledges: number } | null;
  };
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = calculateProgress(campaign.currentAmount, campaign.goalAmount);
  const daysLeft = getDaysRemaining(campaign.endDate);

  return (
    <Link 
      href={`/campaigns/${campaign.slug}`}
      className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={campaign.imageUrl || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80"} 
          alt={campaign.title}
          className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
        
        <div className="absolute top-4 left-4">
           <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-gray-900 rounded-full shadow shadow-black/5">
             {campaign.category || "Dự án"}
           </span>
        </div>

        <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
           <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-green-600/20">
              <ArrowUpRight size={20} strokeWidth={3} />
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1 space-y-3 mb-6">
           <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-2 min-h-[3.5rem] tracking-tight group-hover:text-green-600 transition-colors">
             {campaign.title}
           </h3>
           <p className="text-sm text-gray-400 font-medium line-clamp-2 leading-relaxed">
             {campaign.tagline || "Đang cập nhật giới thiệu dự án..."}
           </p>
        </div>

        {/* Funding Stats */}
        <div className="space-y-4 pt-4 border-t border-gray-50">
           <ProgressBar current={campaign.currentAmount} goal={campaign.goalAmount} showDetails={false} />
           
           <div className="flex justify-between items-center">
              <div>
                 <div className="text-lg font-black text-green-600 tracking-tighter">
                   {formatVND(campaign.currentAmount)}
                 </div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   {progress}% mục tiêu
                 </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-900 uppercase tracking-widest">
                  <Users size={12} className="text-blue-500" />
                  {campaign._count?.pledges || 0}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Clock size={12} className="text-amber-500" />
                  {daysLeft} ngày
                </div>
              </div>
           </div>
        </div>
      </div>
    </Link>
  );
}

