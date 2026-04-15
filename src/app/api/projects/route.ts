import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  githubOwner: z.string().min(1),
  githubRepo: z.string().min(1),
  defaultBranch: z.string().default("main"),
  provider: z.enum(["CLAUDE", "CODEX"]).default("CLAUDE"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { issues: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ data: projects, error: null });
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
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ data: project, error: null }, { status: 201 });
  } catch (error) {
    // WHY: unique constraint 위반 시 중복 프로젝트 안내
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { data: null, error: { code: "DUPLICATE", message: "이미 등록된 레포입니다." } },
        { status: 409 }
      );
    }
    console.error("[API] 프로젝트 생성 실패:", error);
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL", message: "프로젝트를 생성할 수 없습니다." } },
      { status: 500 }
    );
  }
}
