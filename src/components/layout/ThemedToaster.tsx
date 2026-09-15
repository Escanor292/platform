"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  return <Toaster position="top-center" richColors theme={theme} />;
}
