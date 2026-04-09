import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-key";

// WHY: GitHub Actions 워크플로우에서 완료/실패 시 이 엔드포인트로 상태 보고
// PIPELINE_API_KEY로 인증 (사용자 세션 불필요)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API 키가 필요합니다." },
      { status: 401 }
    );
  }

  // API 키 해시 검증
  const keyHash = hashApiKey(apiKey);
  const validKey = await prisma.apiKey.findUnique({ where: { keyHash } });

  if (!validKey) {
    return NextResponse.json(
      { error: "유효하지 않은 API 키입니다." },
      { status: 401 }
    );
  }

  // lastUsed 업데이트
  await prisma.apiKey.update({
    where: { id: validKey.id },
    data: { lastUsed: new Date() },
  });

  const body = await request.json();
  const { issue_id, status, pipeline_stage, pr_url, pr_number, close_reason } = body;

  if (!issue_id) {
    return NextResponse.json(
      { error: "issue_id가 필요합니다." },
      { status: 400 }
    );
  }

  const issue = await prisma.issue.findUnique({ where: { id: issue_id } });
  if (!issue) {
    return NextResponse.json(
      { error: "이슈를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // 상태 업데이트
  const updateData: Record<string, unknown> = {};

  if (status) updateData.status = status;
  if (pipeline_stage) updateData.pipelineStage = pipeline_stage;
  if (pr_url) updateData.prUrl = pr_url;
  if (pr_number) updateData.prNumber = pr_number;
  if (close_reason) updateData.closeReason = close_reason;

  if (Object.keys(updateData).length > 0) {
    await prisma.issue.update({
      where: { id: issue_id },
      data: updateData,
    });
  }

  return NextResponse.json({ ok: true });
}
