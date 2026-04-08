import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const [user, apiKeys, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        githubLogin: true,
        createdAt: true,
      },
    }),
    prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsed: true,
        createdAt: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!user) redirect("/auth/signin");

  return (
    <SettingsClient
      user={{
        ...user,
        createdAt: user.createdAt.toISOString(),
      }}
      apiKeys={apiKeys.map((k) => ({
        ...k,
        lastUsed: k.lastUsed?.toISOString() ?? null,
        createdAt: k.createdAt.toISOString(),
      }))}
      projects={projects}
    />
  );
}
