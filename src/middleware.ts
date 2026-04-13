import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isPublicRoute =
    pathname === "/login" || pathname === "/register" || pathname === "/setup";

  const isDashboardRoute =
    pathname === "/" ||
    pathname.startsWith("/upload") ||
    pathname.startsWith("/gallery") ||
    pathname.startsWith("/send") ||
    pathname.startsWith("/groups") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/settings");

  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      if (pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }
  }

  if (isDashboardRoute) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
