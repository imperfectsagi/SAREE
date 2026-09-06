import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

// Lightweight, fast first line of defense: redirect to /admin/login if
// there's no session cookie at all. This does NOT validate the session
// against D1 (the proxy layer should stay fast and avoid DB calls) — the
// authoritative check happens in every admin Server Component and API
// route via requireUser()/withAuth(), which DOES verify against D1.
// This proxy only prevents obviously-unauthenticated requests from even
// reaching the admin UI.
//
// NOTE: as of Next.js 16 this file convention is named `proxy.ts`
// (formerly `middleware.ts`). The exported function must be named
// `proxy`. Runtime is Node.js (not Edge) — see Next 16 upgrade notes.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and auth API routes through unauthenticated.
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
