import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [projects, issueStats, recentIssues] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { issues: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.issue.groupBy({
      by: ["status"],
      where: { project: { userId: session.user.id } },
      _count: true,
    }),
    prisma.issue.findMany({
      where: { project: { userId: session.user.id } },
      include: {
        project: { select: { name: true, githubOwner: true, githubRepo: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const stats = {
    total: issueStats.reduce((sum, s) => sum + s._count, 0),
    inProgress: issueStats.find((s) => s.status === "IN_PROGRESS")?._count ?? 0,
    prCreated: issueStats.find((s) => s.status === "PR_CREATED")?._count ?? 0,
    merged: issueStats.find((s) => s.status === "MERGED")?._count ?? 0,
  };

  // WHY: 파이프라인 실행 중인 이슈 수 = ANALYZING | CODING 단계
  const activeDispatchCount = await prisma.issue.count({
    where: {
      project: { userId: session.user.id },
      pipelineStage: { in: ["ANALYZING", "CODING"] },
    },
  });

  return (
    <DashboardClient
      stats={stats}
      recentIssues={recentIssues.map((i) => ({
        ...i,
        updatedAt: i.updatedAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
      }))}
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        githubOwner: p.githubOwner,
        githubRepo: p.githubRepo,
        issueCount: p._count.issues,
      }))}
      activeDispatchCount={activeDispatchCount}
    />
  );
}
