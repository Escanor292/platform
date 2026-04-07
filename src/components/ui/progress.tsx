"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const Progress = ({ 
  value = 0, 
  className, 
  indicatorClassName 
}: { 
  value?: number; 
  className?: string; 
  indicatorClassName?: string 
}) => {
  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-100", className)}>
      <div
        className={cn("h-full w-full flex-1 bg-green-500 transition-all duration-500 ease-in-out", indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
};
