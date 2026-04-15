"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IssueList } from "@/components/issues/issue-list";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import { useEventSource } from "@/lib/use-event-source";
import { PIPELINE_CONFIG } from "@/lib/issue-helpers";
import { toast } from "sonner";
import type { IssueCardData } from "@/components/issues/issue-card";
import type { IssueStatus, PipelineStage } from "@prisma/client";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "OPEN", label: "대기 중" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "PR_CREATED", label: "PR 생성됨" },
  { value: "MERGED", label: "완료" },
  { value: "CLOSED", label: "취소됨" },
];

interface Props {
  issues: IssueCardData[];
  projects: { id: string; name: string; defaultBranch: string }[];
}

export function IssuesClient({ issues, projects }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [pipelineFilter, setPipelineFilter] = useState("ALL");

  useEventSource("/api/events", {
    "issues:updated": (data) => {
      const updated = data as IssueCardData[];
      if (updated.length > 0) {
        toast.info(`${updated.length}건의 이슈가 업데이트되었습니다.`);
        router.refresh();
      }
    },
  });

  const filtered = issues.filter((i) => {
    const statusMatch = statusFilter === "ALL" || i.status === (statusFilter as IssueStatus);
    const pipelineMatch = pipelineFilter === "ALL" || i.pipelineStage === (pipelineFilter as PipelineStage);
    return statusMatch && pipelineMatch;
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">이슈</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            파이프라인 이슈를 관리하세요. 총 {issues.length}건
          </p>
        </div>
        <CreateIssueDialog projects={projects} />
      </div>

      {/* 필터 영역 */}
      <div className="flex items-center gap-4">
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex-1">
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 파이프라인 단계 필터 */}
        <Select value={pipelineFilter} onValueChange={setPipelineFilter}>
          <SelectTrigger className="w-[160px]" aria-label="파이프라인 단계 필터">
            <SelectValue placeholder="파이프라인" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 단계</SelectItem>
            {Object.entries(PIPELINE_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.icon} {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 이슈 리스트 */}
      <IssueList issues={filtered} />
    </div>
  );
}
