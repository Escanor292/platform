import React from "react";
import { Card, Button } from "@/components/ui";
import { formatVND, cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface RewardTierProps {
  id: string;
  amount: number;
  title: string;
  description: string;
  perks: string[];
  limit?: number;
  claimed?: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const RewardTier = ({
  id,
  amount,
  title,
  description,
  perks,
  limit,
  claimed = 0,
  isSelected = false,
  onSelect,
}: RewardTierProps) => {
  const isSoldOut = limit !== undefined && claimed >= limit;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all border-2 group",
        isSelected ? "border-green-500 shadow-2xl shadow-green-200" : "border-transparent hover:border-gray-200",
        isSoldOut && "opacity-60 cursor-not-allowed grayscale"
      )}
      onClick={() => !isSoldOut && onSelect?.(id)}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-1">{title}</h3>
          <p className="text-xl font-bold text-green-600">{formatVND(amount)}</p>
        </div>
        {limit && (
          <div className="text-right">
            <p className="text-xs font-black uppercase text-gray-400">Giới hạn</p>
            <p className="text-sm font-bold text-gray-900">{claimed}/{limit}</p>
          </div>
        )}
      </div>

      <p className="text-gray-500 font-medium mb-6 leading-relaxed">{description}</p>

      <div className="space-y-3 mb-8">
        {perks.map((perk, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-green-50 text-green-600 flex-shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-gray-700">{perk}</p>
          </div>
        ))}
      </div>

      <Button 
        className="w-full rounded-xl" 
        variant={isSelected ? "primary" : "outline"}
        disabled={isSoldOut}
      >
        {isSoldOut ? "Đã hết lượt" : isSelected ? "Đã chọn" : "Lựa chọn này"}
      </Button>
    </Card>
  );
};


