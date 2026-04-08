"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { IssueCard, type IssueCardData } from "./issue-card";
import { STATUS_CONFIG } from "@/lib/issue-helpers";
import type { IssueStatus } from "@prisma/client";

const KANBAN_COLUMNS: IssueStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "PR_CREATED",
  "MERGED",
];

export function KanbanBoard({ issues }: { issues: IssueCardData[] }) {
  const grouped = KANBAN_COLUMNS.reduce(
    (acc, status) => {
      acc[status] = issues.filter((i) => i.status === status);
      return acc;
    },
    {} as Record<IssueStatus, IssueCardData[]>
  );

  return (
    <div className="flex flex-col gap-4 lg:grid lg:auto-cols-[280px] lg:grid-flow-col lg:overflow-x-auto lg:pb-4">
      {KANBAN_COLUMNS.map((status) => {
        const config = STATUS_CONFIG[status];
        const columnIssues = grouped[status] ?? [];

        return (
          <div
            key={status}
            className="flex flex-col rounded-lg border border-border bg-card/50"
            role="region"
            aria-label={`${config.label} (${columnIssues.length}건)`}
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <span
                className={`inline-block h-2 w-2 rounded-full ${config.color.split(" ")[0]}`}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{config.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {columnIssues.length}건
              </span>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-3">
                {columnIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
                {columnIssues.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    이슈 없음
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
