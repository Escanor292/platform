"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" }
>(({ className, variant = "primary", ...props }, ref) => {
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-500/20 active:scale-95",
    secondary: "bg-gray-900 text-white hover:bg-black shadow-xl active:scale-95",
    outline: "border-2 border-gray-100 bg-transparent text-gray-900 hover:border-gray-200 active:scale-95",
    ghost: "bg-transparent text-gray-500 hover:text-green-600 hover:bg-green-50",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
