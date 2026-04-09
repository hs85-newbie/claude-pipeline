import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/require-onboarded";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const userId = await requireOnboarded();

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      _count: { select: { issues: true, apiKeys: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <ProjectsClient
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        githubOwner: p.githubOwner,
        githubRepo: p.githubRepo,
        defaultBranch: p.defaultBranch,
        issueCount: p._count.issues,
        apiKeyCount: p._count.apiKeys,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  );
}
