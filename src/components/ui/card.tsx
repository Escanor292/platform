import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ 
  className, 
  children,
  onClick 
}: { 
  className?: string; 
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <div 
    className={cn("bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100", className)}
    onClick={onClick}
  >
    {children}
  </div>
);
