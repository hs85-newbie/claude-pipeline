"use client";

import { IssueCard, type IssueCardData } from "./issue-card";

export function IssueList({ issues }: { issues: IssueCardData[] }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">이슈가 없습니다.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          새 이슈를 생성해서 파이프라인을 시작하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
