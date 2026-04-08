import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(50),
  projectId: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsed: true,
      createdAt: true,
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: keys, error: null });
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
  const parsed = createKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "이름을 입력해주세요." } },
      { status: 400 }
    );
  }

  // WHY: projectId가 있으면 소유권 확인
  if (parsed.data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: parsed.data.projectId, userId: session.user.id },
    });
    if (!project) {
      return NextResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "프로젝트를 찾을 수 없습니다." } },
        { status: 404 }
      );
    }
  }

  const { raw, hash, prefix } = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      keyHash: hash,
      keyPrefix: prefix,
      userId: session.user.id,
      projectId: parsed.data.projectId ?? null,
    },
  });

  // WHY: raw 키는 이 응답에서만 반환 — DB에는 해시만 저장
  return NextResponse.json(
    {
      data: { id: apiKey.id, name: apiKey.name, key: raw, prefix },
      error: null,
    },
    { status: 201 }
  );
}
