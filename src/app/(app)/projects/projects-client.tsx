"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderGit2,
  ExternalLink,
  Trash2,
  Loader2,
  CircleDot,
  Key,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/issue-helpers";

interface ProjectItem {
  id: string;
  name: string;
  githubOwner: string;
  githubRepo: string;
  defaultBranch: string;
  issueCount: number;
  apiKeyCount: number;
  createdAt: string;
}

export function ProjectsClient({ projects }: { projects: ProjectItem[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 프로젝트를 삭제하시겠습니까? 관련 이슈와 API 키도 함께 삭제됩니다.`)) return;
    setDeleting(id);

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) {
        toast.error(json.error.message);
        return;
      }
      toast.success("프로젝트가 삭제되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("[Projects] 삭제 실패:", error);
      toast.error("프로젝트를 삭제할 수 없습니다.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">프로젝트</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          연결된 GitHub 레포를 관리하세요. {projects.length}개 프로젝트
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderGit2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              아직 프로젝트가 없습니다. 온보딩에서 레포를 연결하세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <a
                      href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                    >
                      {project.githubOwner}/{project.githubRepo}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(project.id, project.name)}
                    disabled={deleting === project.id}
                  >
                    {deleting === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {project.defaultBranch}
                  </span>
                  <span className="flex items-center gap-1">
                    <CircleDot className="h-3 w-3" />
                    이슈 {project.issueCount}건
                  </span>
                  <span className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    키 {project.apiKeyCount}개
                  </span>
                </div>

                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatRelativeTime(project.createdAt)} 생성
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
