"use client";

import LocaleToggle from "./LocaleToggle";
import ThemeToggle from "./ThemeToggle";

export default function ChromeToggles({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <ThemeToggle />
      <LocaleToggle />
    </div>
  );
}
