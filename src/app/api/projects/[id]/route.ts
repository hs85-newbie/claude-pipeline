import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type RouteContext = { params: Promise<{ id: string }> };

const updateProjectSchema = z.object({
  provider: z.enum(["CLAUDE", "CODEX"]).optional(),
  defaultBranch: z.string().min(1).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "변경할 필드가 없습니다.",
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      _count: { select: { issues: true, apiKeys: true } },
    },
  });

  if (!project) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "프로젝트를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: project, error: null });
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
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." } },
      { status: 400 }
    );
  }

  const existing = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "프로젝트를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ data: project, error: null });
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

  const existing = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "프로젝트를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  // WHY: Cascade 설정으로 관련 이슈/API키도 함께 삭제됨
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true }, error: null });
}
