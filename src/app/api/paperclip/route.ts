import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { paperclipFetch } from "@/lib/paperclip";

// WHY: Paperclip API를 직접 노출하지 않고 프록시를 통해 인증 + 레이트 리밋 제어
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  try {
    const { path, method, body } = await request.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "path가 필요합니다." } },
        { status: 400 }
      );
    }

    const data = await paperclipFetch({ path, method, body });

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("[API] Paperclip 프록시 실패:", error);
    return NextResponse.json(
      { data: null, error: { code: "PAPERCLIP_ERROR", message: "Paperclip 서비스에 연결할 수 없습니다." } },
      { status: 502 }
    );
  }
}
