import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  // WHY: 프로젝트가 최소 1개 있어야 온보딩 완료 가능
  const projectCount = await prisma.project.count({
    where: { userId: session.user.id },
  });

  if (projectCount === 0) {
    return NextResponse.json(
      { data: null, error: { code: "NO_PROJECT", message: "프로젝트를 먼저 등록해주세요." } },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboarded: true },
  });

  return NextResponse.json({ data: { onboarded: true }, error: null });
}
