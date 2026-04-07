"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { SessionUser } from "@/types/user";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as SessionUser | undefined;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const login = useCallback(
    async (provider: "google" | "credentials" = "google", callbackUrl = "/") => {
      await signIn(provider, { callbackUrl });
    },
    []
  );

  const logout = useCallback(async (callbackUrl = "/") => {
    await signOut({ callbackUrl });
  }, []);

  const requireAuth = useCallback(
    (redirectTo?: string) => {
      if (!isLoading && !isAuthenticated) {
        const url = redirectTo ?? `/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
        router.push(url);
        return false;
      }
      return isAuthenticated;
    },
    [isLoading, isAuthenticated, router]
  );

  const isCreator = user?.role === "CREATOR" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  return {
    user,
    isLoading,
    isAuthenticated,
    isCreator,
    isAdmin,
    login,
    logout,
    requireAuth,
  };
}
