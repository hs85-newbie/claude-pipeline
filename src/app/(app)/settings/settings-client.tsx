"use client";

import { ProfileCard } from "@/components/settings/profile-card";
import { ApiKeysCard } from "@/components/settings/api-keys-card";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  githubLogin: string | null;
  createdAt: string;
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsed: string | null;
  createdAt: string;
  project: { id: string; name: string } | null;
}

interface Props {
  user: User;
  apiKeys: ApiKeyItem[];
  projects: { id: string; name: string }[];
}

export function SettingsClient({ user, apiKeys, projects }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          프로필과 API 키를 관리하세요.
        </p>
      </div>

      <ProfileCard user={user} />
      <ApiKeysCard apiKeys={apiKeys} projects={projects} />
    </div>
  );
}
