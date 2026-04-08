"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FolderGit2,
  Loader2,
  Search,
  Lock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingState } from "./onboarding-wizard";

interface RepoItem {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  description: string | null;
  language: string | null;
  updatedAt: string;
}

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  onNext: () => void;
}

export function StepRepo({ state, setState, onNext }: Props) {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRepos();
  }, []);

  async function fetchRepos() {
    try {
      setLoading(true);
      const res = await fetch("/api/github/repos");
      const json = await res.json();

      if (json.error) {
        setError(json.error.message);
        return;
      }

      setRepos(json.data);
    } catch (err) {
      console.error("[Onboarding] 레포 목록 조회 실패:", err);
      setError("레포 목록을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(repo: RepoItem) {
    setState((prev) => ({
      ...prev,
      selectedRepo: {
        owner: repo.owner,
        name: repo.name,
        fullName: repo.fullName,
        defaultBranch: repo.defaultBranch,
      },
    }));
  }

  async function handleNext() {
    if (!state.selectedRepo) return;

    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.selectedRepo.name,
          githubOwner: state.selectedRepo.owner,
          githubRepo: state.selectedRepo.name,
          defaultBranch: state.selectedRepo.defaultBranch,
        }),
      });

      const json = await res.json();

      if (json.error && json.error.code !== "DUPLICATE") {
        setError(json.error.message);
        return;
      }

      setState((prev) => ({
        ...prev,
        projectId: json.data?.id ?? prev.projectId,
      }));
      onNext();
    } catch (err) {
      console.error("[Onboarding] 프로젝트 생성 실패:", err);
      setError("프로젝트를 생성할 수 없습니다.");
    } finally {
      setCreating(false);
    }
  }

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5" />
          레포지토리 선택
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          파이프라인을 연결할 GitHub 레포를 선택하세요.
        </p>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="레포 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 레포 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              레포 목록을 불러오는 중...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchRepos}
            >
              다시 시도
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-1">
              {filtered.map((repo) => {
                const isSelected =
                  state.selectedRepo?.fullName === repo.fullName;
                return (
                  <button
                    key={repo.id}
                    type="button"
                    onClick={() => handleSelect(repo)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-accent"
                    )}
                  >
                    {repo.isPrivate ? (
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {repo.fullName}
                      </p>
                      {repo.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    {repo.language && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {repo.language}
                      </Badge>
                    )}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  검색 결과가 없습니다.
                </p>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!state.selectedRepo || creating}
          >
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            다음
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
