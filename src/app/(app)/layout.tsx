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
