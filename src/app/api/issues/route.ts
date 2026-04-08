import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createIssueSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  projectId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  // WHY: 사용자 소유 프로젝트의 이슈만 조회 가능하도록 보안 필터
  const where = {
    project: { userId: session.user.id },
    ...(projectId ? { projectId } : {}),
    ...(status ? { status: status as "OPEN" | "IN_PROGRESS" | "PR_CREATED" | "MERGED" | "CLOSED" } : {}),
  };

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      include: {
        project: { select: { name: true, githubOwner: true, githubRepo: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.issue.count({ where }),
  ]);

  return NextResponse.json({
    data: issues,
    error: null,
    meta: { page, limit, total },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const parsed = createIssueSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  // WHY: 사용자 소유 프로젝트인지 확인
  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "프로젝트를 찾을 수 없습니다." } },
      { status: 404 }
    );
  }

  const issue = await prisma.issue.create({
    data: parsed.data,
    include: {
      project: { select: { name: true, githubOwner: true, githubRepo: true } },
    },
  });

  return NextResponse.json({ data: issue, error: null }, { status: 201 });
}
