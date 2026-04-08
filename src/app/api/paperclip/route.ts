import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { paperclipFetch } from "@/lib/paperclip";
import { z } from "zod";

// WHY: SSRF 방지 — 허용된 경로만 프록시 가능
const ALLOWED_PATH_PREFIXES = [
  "/api/v1/companies",
  "/api/v1/issues",
  "/api/v1/dispatch",
] as const;

const ALLOWED_METHODS = ["GET", "POST", "PATCH"] as const;

const proxySchema = z.object({
  path: z.string().min(1).refine(
    (p) => ALLOWED_PATH_PREFIXES.some((prefix) => p.startsWith(prefix)),
    { message: "허용되지 않는 경로입니다." }
  ),
  method: z.enum(ALLOWED_METHODS).default("GET"),
  body: z.unknown().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  try {
    const raw = await request.json();
    const parsed = proxySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "입력이 올바르지 않습니다." } },
        { status: 400 }
      );
    }

    const data = await paperclipFetch(parsed.data);

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("[API] Paperclip 프록시 실패:", error);
    return NextResponse.json(
      { data: null, error: { code: "PAPERCLIP_ERROR", message: "Paperclip 서비스에 연결할 수 없습니다." } },
      { status: 502 }
    );
  }
}
