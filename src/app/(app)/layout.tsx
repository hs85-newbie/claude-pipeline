import { redirect } from "next/navigation";
import { auth } from "@/auth";
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

  // WHY: 온보딩 미완료 사용자는 온보딩 페이지로 리다이렉트
  // 온보딩 페이지 자체에서는 무한 리다이렉트 방지
  if (!session.user.onboarded) {
    // 현재 경로가 온보딩이 아닌 경우에만 리다이렉트
    // NOTE: 서버 컴포넌트에서 pathname 접근 불가하므로 미들웨어에서 처리 필요
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
