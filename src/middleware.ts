import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public routes that don't need authentication
    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/campaigns") ||
      pathname.startsWith("/lookup") ||
      pathname.startsWith("/policy") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/projects");

    // API routes that are public
    const isPublicApiRoute =
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/stats") ||
      pathname.startsWith("/api/projects") ||
      pathname.startsWith("/api/campaigns") ||
      pathname.startsWith("/api/lookup");

    // Auth routes
    const isAuthRoute =
      pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register");

    // Allow public API routes and auth routes
    if (isPublicApiRoute || isAuthRoute) {
      return NextResponse.next();
    }

    // If user is logged in and trying to access auth routes, redirect to dashboard
    if (session?.user && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};