import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "PR_CREATED", "MERGED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  closeReason: z.enum(["USER_CANCELLED", "PIPELINE_FAILED", "DUPLICATE", "WONT_FIX"]).optional().nullable(),
  pipelineStage: z.enum(["QUEUED", "ANALYZING", "CODING", "PR_REVIEW", "MERGED", "FAILED"]).optional(),
  prUrl: z.string().url().optional().nullable(),
  prNumber: z.number().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const issue = await prisma.issue.findFirst({
    where: { id, project: { userId: session.user.id } },
    include: {
      project: { select: { name: true, githubOwner: true, githubRepo: true } },
    },
  });

  if (!issue) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "이슈를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: issue, error: null });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateIssueSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "입력값이 올바르지 않습니다." } },
      { status: 400 }
    );
  }

  // WHY: 사용자 소유 프로젝트의 이슈만 수정 가능
  const existing = await prisma.issue.findFirst({
    where: { id, project: { userId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "이슈를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const issue = await prisma.issue.update({
    where: { id },
    data: parsed.data,
    include: {
      project: { select: { name: true, githubOwner: true, githubRepo: true } },
    },
  });

  return NextResponse.json({ data: issue, error: null });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const existing = await prisma.issue.findFirst({
    where: { id, project: { userId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "이슈를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  await prisma.issue.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true }, error: null });
}
