import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
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
      const isPublicRoute = 
        nextUrl.pathname === "/" || 
        nextUrl.pathname.startsWith("/campaigns") || 
        nextUrl.pathname.startsWith("/lookup") ||
        nextUrl.pathname.startsWith("/policy") ||
        nextUrl.pathname.startsWith("/about");
      const isAuthRoute = 
        nextUrl.pathname.startsWith("/auth/login") || 
        nextUrl.pathname.startsWith("/auth/register");

      if (isApiAuthRoute) return true;

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
