"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
