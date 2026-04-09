"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  ISSUE_TYPE_CONFIG,
  PIPELINE_CONFIG,
  CLOSE_REASON_CONFIG,
  formatRelativeTime,
} from "@/lib/issue-helpers";
import type { IssueStatus, IssuePriority, IssueType, PipelineStage, CloseReason } from "@prisma/client";

export interface IssueCardData {
  id: string;
  title: string;
  status: IssueStatus;
  type: IssueType;
  priority: IssuePriority;
  pipelineStage: PipelineStage;
  closeReason: CloseReason | null;
  prUrl: string | null;
  prNumber: number | null;
  updatedAt: string;
  project: { name: string; githubOwner: string; githubRepo: string };
}

export function IssueCard({ issue }: { issue: IssueCardData }) {
  const statusCfg = STATUS_CONFIG[issue.status];
  const priorityCfg = PRIORITY_CONFIG[issue.priority];
  const pipelineCfg = PIPELINE_CONFIG[issue.pipelineStage];

  return (
    <Link href={`/issues/${issue.id}`} aria-label={`${issue.title} — ${statusCfg.label}, ${priorityCfg.label} 우선순위`}>
      <Card className="group p-4 transition-colors hover:bg-accent/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {issue.project.name}
              </span>
              <span className={`text-xs ${priorityCfg.color}`}>
                {priorityCfg.label}
              </span>
              {issue.type === "ANALYSIS" && (
                <Badge variant="secondary" className="text-xs">
                  {ISSUE_TYPE_CONFIG.ANALYSIS.label}
                </Badge>
              )}
            </div>
            <h3 className="mt-1 truncate text-sm font-medium group-hover:text-primary">
              {issue.title}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${statusCfg.color}`}
              >
                {statusCfg.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {pipelineCfg.icon} {pipelineCfg.label}
              </span>
              {issue.status === "CLOSED" && issue.closeReason && (
                <span className={`text-xs ${CLOSE_REASON_CONFIG[issue.closeReason].color}`}>
                  {CLOSE_REASON_CONFIG[issue.closeReason].label}
                </span>
              )}
              {issue.prUrl && (
                <a
                  href={issue.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  PR #{issue.prNumber}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(issue.updatedAt)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
