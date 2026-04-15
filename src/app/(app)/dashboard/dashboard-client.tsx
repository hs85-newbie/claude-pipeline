"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatCards } from "@/components/dashboard/stat-cards";
import { DispatchIndicator } from "@/components/dashboard/dispatch-indicator";
import { IssueList } from "@/components/issues/issue-list";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEventSource } from "@/lib/use-event-source";
import { toast } from "sonner";
import { ArrowRight, FolderGit2 } from "lucide-react";
import type { IssueCardData } from "@/components/issues/issue-card";

interface Props {
  stats: { total: number; inProgress: number; prCreated: number; merged: number };
  recentIssues: IssueCardData[];
  projects: { id: string; name: string; defaultBranch: string; githubOwner: string; githubRepo: string; issueCount: number }[];
  activeDispatchCount: number;
}

export function DashboardClient({
  stats,
  recentIssues,
  projects,
  activeDispatchCount,
}: Props) {
  const router = useRouter();

  // WHY: SSE로 이슈 변경 이벤트 수신 → 자동 새로고침 + 토스트 알림
  useEventSource("/api/events", {
    "issues:updated": (data) => {
      const issues = data as IssueCardData[];
      if (issues.length > 0) {
        toast.info(`${issues.length}건의 이슈가 업데이트되었습니다.`);
        router.refresh();
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            파이프라인 현황을 한눈에 확인하세요.
          </p>
        </div>
        <CreateIssueDialog
          projects={projects.map((p) => ({ id: p.id, name: p.name, defaultBranch: p.defaultBranch }))}
        />
      </div>

      {/* dispatch 실행 인디케이터 */}
      <DispatchIndicator activeCount={activeDispatchCount} />

      {/* 통계 카드 */}
      <StatCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* 최근 이슈 */}
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              최근 이슈
            </h2>
            <Link href="/issues">
              <Button variant="ghost" size="sm" className="text-xs">
                모든 이슈 보기
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <IssueList issues={recentIssues} />
        </div>

        {/* 프로젝트 요약 */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            프로젝트
          </h2>
          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FolderGit2 className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  아직 프로젝트가 없습니다.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground">
                      {project.githubOwner}/{project.githubRepo}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      이슈 {project.issueCount}건
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
