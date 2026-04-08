import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// WHY: auth()를 import하면 Prisma가 Edge Runtime에서 실행되어 에러 발생
// JWT 세션 쿠키 존재 여부만으로 인증 상태를 판단
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = pathname === "/" || pathname.startsWith("/docs");
  const isAuthPage = pathname.startsWith("/auth");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiPublic = pathname === "/api/health";

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

  // WHY: 온보딩 미완료 사용자는 온보딩 페이지로 리다이렉트
  // Edge Runtime에서는 Prisma 사용 불가 → 쿠키 기반 체크
  const onboarded = request.cookies.get("onboarded")?.value === "true";
  const isOnboarding = pathname.startsWith("/onboarding");
  const isApi = pathname.startsWith("/api");

  if (isLoggedIn && !onboarded && !isOnboarding && !isApi) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
