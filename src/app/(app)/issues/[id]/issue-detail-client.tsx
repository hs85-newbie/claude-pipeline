"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  PIPELINE_CONFIG,
  formatRelativeTime,
} from "@/lib/issue-helpers";
import { useEventSource } from "@/lib/use-event-source";
import { toast } from "sonner";
import type { IssueStatus, IssuePriority, PipelineStage } from "@prisma/client";

interface IssueDetail {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  pipelineStage: PipelineStage;
  prUrl: string | null;
  prNumber: number | null;
  createdAt: string;
  updatedAt: string;
  project: { name: string; githubOwner: string; githubRepo: string };
}

export function IssueDetailClient({ issue }: { issue: IssueDetail }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // WHY: 이 이슈가 업데이트되면 자동 새로고침
  useEventSource("/api/events", {
    "issues:updated": (data) => {
      const issues = data as { id: string }[];
      if (issues.some((i) => i.id === issue.id)) {
        router.refresh();
      }
    },
  });

  async function handleStatusChange(status: IssueStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.error) {
        toast.error(json.error.message);
        return;
      }
      toast.success("상태가 변경되었습니다.");
      router.refresh();
    } catch (error) {
      console.error("[Issue] 상태 변경 실패:", error);
      toast.error("상태를 변경할 수 없습니다.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("이 이슈를 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.error) {
        toast.error(json.error.message);
        return;
      }
      toast.success("이슈가 삭제되었습니다.");
      router.push("/issues");
    } catch (error) {
      console.error("[Issue] 삭제 실패:", error);
      toast.error("이슈를 삭제할 수 없습니다.");
    } finally {
      setDeleting(false);
    }
  }

  const priorityCfg = PRIORITY_CONFIG[issue.priority];
  const pipelineCfg = PIPELINE_CONFIG[issue.pipelineStage];

  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <Link href="/issues">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          이슈 목록
        </Button>
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {issue.project.githubOwner}/{issue.project.githubRepo}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {issue.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            삭제
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 본문 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">설명</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {issue.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  설명이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* 파이프라인 타임라인 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">파이프라인 진행</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineTimeline currentStage={issue.pipelineStage} />
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              {/* 상태 */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  상태
                </p>
                <Select
                  value={issue.status}
                  onValueChange={(v) => handleStatusChange(v as IssueStatus)}
                  disabled={updating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>
                        {cfg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 우선순위 */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  우선순위
                </p>
                <Badge variant="outline" className={priorityCfg.color}>
                  {priorityCfg.label}
                </Badge>
              </div>

              {/* 파이프라인 단계 */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  파이프라인
                </p>
                <span className="text-sm">
                  {pipelineCfg.icon} {pipelineCfg.label}
                </span>
              </div>

              {/* PR 링크 */}
              {issue.prUrl && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Pull Request
                  </p>
                  <a
                    href={issue.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    PR #{issue.prNumber}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* 날짜 */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  생성
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(issue.createdAt)}
                </span>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  업데이트
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(issue.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// WHY: 파이프라인 진행 상태를 시각적 타임라인으로 표시
const PIPELINE_ORDER: PipelineStage[] = [
  "QUEUED",
  "ANALYZING",
  "CODING",
  "PR_REVIEW",
  "MERGED",
];

function PipelineTimeline({ currentStage }: { currentStage: PipelineStage }) {
  const currentIndex = PIPELINE_ORDER.indexOf(currentStage);
  const isFailed = currentStage === "FAILED";

  return (
    <div className="flex items-center gap-2">
      {PIPELINE_ORDER.map((stage, i) => {
        const cfg = PIPELINE_CONFIG[stage];
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={stage} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-6 ${isDone ? "bg-[hsl(var(--success))]" : "bg-border"}`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isFailed && isActive
                  ? "bg-destructive/20 text-destructive"
                  : isActive
                    ? "bg-primary/20 text-primary"
                    : isDone
                      ? "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </div>
          </div>
        );
      })}
      {isFailed && (
        <div className="flex items-center gap-2">
          <div className="h-px w-6 bg-destructive" />
          <div className="flex items-center gap-1.5 rounded-full bg-destructive/20 px-3 py-1 text-xs font-medium text-destructive">
            ❌ 실패
          </div>
        </div>
      )}
    </div>
  );
}
