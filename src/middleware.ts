import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const session = await auth();

    // Public routes that don't need authentication
    const isPublicRoute =
      pathname === "/" ||
      pathname.startsWith("/campaigns") ||
      pathname.startsWith("/products") ||
      pathname.startsWith("/lookup") ||
      pathname.startsWith("/hoa-don") ||
      pathname.startsWith("/chung-tu") ||
      pathname.startsWith("/huong-dan") ||
      pathname.startsWith("/policy") ||
      pathname.startsWith("/gioi-thieu") ||
      pathname.startsWith("/blog") ||
      pathname.startsWith("/projects") ||
      pathname.startsWith("/t/") ||
      (pathname.startsWith("/profile/") && !pathname.startsWith("/profile/edit")) ||
      pathname.startsWith("/users/search");

    // API routes that are public
    const isPublicApiRoute =
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/stats") ||
      pathname.startsWith("/api/projects") ||
      pathname.startsWith("/api/campaigns") ||
      pathname.startsWith("/api/lookup") ||
      pathname.startsWith("/api/users/search") ||
      pathname.startsWith("/api/stats/users") ||
      pathname.startsWith("/api/blog");

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
