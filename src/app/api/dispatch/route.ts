import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { triggerDispatch } from "@/lib/dispatch";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { issueId } = await request.json();

  if (!issueId || typeof issueId !== "string") {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "issueId가 필요합니다." } },
      { status: 400 }
    );
  }

  // WHY: 사용자 소유 이슈인지 확인
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, project: { userId: session.user.id } },
  });

  if (!issue) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "이슈를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  if (issue.status !== "OPEN") {
    return NextResponse.json(
      { data: null, error: { code: "INVALID_STATE", message: "대기 중 상태의 이슈만 실행할 수 있습니다." } },
      { status: 400 }
    );
  }

  try {
    await triggerDispatch(issueId);
    return NextResponse.json({ data: { dispatched: true }, error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "파이프라인 실행에 실패했습니다.";
    console.error("[API] Dispatch 실패:", error);
    return NextResponse.json(
      { data: null, error: { code: "DISPATCH_ERROR", message } },
      { status: 500 }
    );
  }
}
