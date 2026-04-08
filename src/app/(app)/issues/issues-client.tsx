"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IssueList } from "@/components/issues/issue-list";
import { KanbanBoard } from "@/components/issues/kanban-board";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import { useEventSource } from "@/lib/use-event-source";
import { toast } from "sonner";
import { LayoutList, Columns3 } from "lucide-react";
import type { IssueCardData } from "@/components/issues/issue-card";
import type { IssueStatus } from "@prisma/client";

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
  projects: { id: string; name: string }[];
}

export function IssuesClient({ issues, projects }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEventSource("/api/events", {
    "issues:updated": (data) => {
      const updated = data as IssueCardData[];
      if (updated.length > 0) {
        toast.info(`${updated.length}건의 이슈가 업데이트되었습니다.`);
        router.refresh();
      }
    },
  });

  const filtered =
    statusFilter === "ALL"
      ? issues
      : issues.filter((i) => i.status === (statusFilter as IssueStatus));

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
        <div className="flex items-center gap-2">
          {/* 뷰 토글 */}
          <div className="flex rounded-md border border-border">
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView("kanban")}
            >
              <Columns3 className="h-4 w-4" />
            </Button>
          </div>
          <CreateIssueDialog projects={projects} />
        </div>
      </div>

      {/* 상태 필터 탭 */}
      {view === "list" && (
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* 이슈 뷰 */}
      {view === "list" ? (
        <IssueList issues={filtered} />
      ) : (
        <KanbanBoard issues={issues} />
      )}
    </div>
  );
}
