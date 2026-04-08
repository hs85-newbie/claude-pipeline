import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  // WHY: JWT의 onboarded는 캐시 — DB에서 최신 상태 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true, githubLogin: true },
  });

  if (user?.onboarded) redirect("/dashboard");

  return (
    <div className="py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          프로젝트 설정
        </h1>
        <p className="mt-2 text-muted-foreground">
          몇 단계만 거치면 AI 파이프라인을 사용할 수 있습니다.
        </p>
      </div>
      <OnboardingWizard githubLogin={user?.githubLogin ?? ""} />
    </div>
  );
}
