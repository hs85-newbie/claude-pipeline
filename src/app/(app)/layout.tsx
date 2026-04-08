import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Providers } from "@/components/layout/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // WHY: DB에서 onboarded 최신 상태 확인 → 미완료 시 온보딩 리다이렉트
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  const headerList = await headers();
  const pathname = headerList.get("x-next-url") ?? headerList.get("x-invoke-path") ?? "";
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!dbUser?.onboarded && !isOnboarding) {
    redirect("/onboarding");
  }

  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:pl-[240px]">
          <Header />
          <main className="mx-auto max-w-[1280px] p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
