"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { calculateProgress, formatVND } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  goal: number;
  showDetails?: boolean;
}

export const ProgressBar = ({ current, goal, showDetails = true }: ProgressBarProps) => {
  const percentage = calculateProgress(current, goal);

  return (
    <div className="space-y-3">
      <Progress value={percentage} className="h-4 bg-green-50" indicatorClassName="bg-green-500" />
      
      {showDetails && (
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-black text-green-600">{formatVND(current)}</p>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              đã đạt được của {formatVND(goal)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-gray-900">{percentage}%</p>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">tiến độ</p>
          </div>
        </div>
      )}
    </div>
  );
};
