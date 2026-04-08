import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

  // WHY: JWT의 onboarded는 캐시될 수 있으므로 DB에서 최신 상태 확인 후 쿠키 동기화
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  const cookieStore = await cookies();
  if (dbUser?.onboarded) {
    cookieStore.set("onboarded", "true", { path: "/", httpOnly: false });
  }

  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 pl-[240px]">
          <Header />
          <main className="mx-auto max-w-[1280px] p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
