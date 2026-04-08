import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const existing = await prisma.apiKey.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "API 키를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  await prisma.apiKey.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true }, error: null });
}
