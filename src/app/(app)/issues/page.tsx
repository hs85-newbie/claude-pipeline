import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { IssuesClient } from "./issues-client";

export default async function IssuesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [issues, projects] = await Promise.all([
    prisma.issue.findMany({
      where: { project: { userId: session.user.id } },
      include: {
        project: { select: { name: true, githubOwner: true, githubRepo: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
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
