import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/require-onboarded";
import { IssuesClient } from "./issues-client";

export default async function IssuesPage() {
  const userId = await requireOnboarded();

  const [issues, projects] = await Promise.all([
    prisma.issue.findMany({
      where: { project: { userId } },
      include: {
        project: { select: { name: true, githubOwner: true, githubRepo: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, defaultBranch: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <IssuesClient
      issues={issues.map((i) => ({
        ...i,
        updatedAt: i.updatedAt.toISOString(),
        createdAt: i.createdAt.toISOString(),
      }))}
      projects={projects}
    />
  );
}
