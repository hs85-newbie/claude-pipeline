import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// WHY: auth()를 import하면 Prisma가 Edge Runtime에서 실행되어 에러 발생
// JWT 세션 쿠키 존재 여부만으로 인증 상태를 판단
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = pathname === "/" || pathname.startsWith("/docs");
  const isAuthPage = pathname.startsWith("/auth");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiPublic = pathname === "/api/health" || pathname.startsWith("/api/webhooks");

  if (isApiAuth || isApiPublic || isPublic) return NextResponse.next();

  // NextAuth JWT 세션 쿠키 확인
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token");

  const isLoggedIn = !!sessionToken;

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
