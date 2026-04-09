import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * 온보딩 완료 여부 확인 — 미완료 시 /onboarding으로 리다이렉트
 * @returns 인증된 사용자 ID
 */
export async function requireOnboarded(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  if (!user?.onboarded) redirect("/onboarding");

  return session.user.id;
}
