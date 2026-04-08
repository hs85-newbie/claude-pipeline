"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  PIPELINE_CONFIG,
  formatRelativeTime,
} from "@/lib/issue-helpers";
import type { IssueStatus, IssuePriority, PipelineStage } from "@prisma/client";

export interface IssueCardData {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  pipelineStage: PipelineStage;
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
    <Link href={`/issues/${issue.id}`}>
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
