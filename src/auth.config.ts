import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  trustHost: true, // Trust the host header
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isPublicApiRoute =
        nextUrl.pathname.startsWith("/api/stats") ||
        nextUrl.pathname.startsWith("/api/projects") ||
        nextUrl.pathname.startsWith("/api/campaigns") ||
        nextUrl.pathname.startsWith("/api/lookup");
      const isPublicRoute =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/campaigns") ||
        nextUrl.pathname.startsWith("/lookup") ||
        nextUrl.pathname.startsWith("/policy") ||
        nextUrl.pathname.startsWith("/gioi-thieu");
      const isAuthRoute =
        nextUrl.pathname.startsWith("/auth/login") ||
        nextUrl.pathname.startsWith("/auth/register");

      if (isApiAuthRoute || isPublicApiRoute) return true;

      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (!isLoggedIn && !isPublicRoute) return false;

      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig;
