import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { IssueDetailClient } from "./issue-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;

  const issue = await prisma.issue.findFirst({
    where: { id, project: { userId: session.user.id } },
    include: {
      project: { select: { name: true, githubOwner: true, githubRepo: true } },
    },
  });

  if (!issue) notFound();

  return (
    <IssueDetailClient
      issue={{
        ...issue,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
      }}
    />
  );
}
