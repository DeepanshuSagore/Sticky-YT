import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "stickyyt_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/me")) && !hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/me/:path*", "/login", "/signup"],
};
