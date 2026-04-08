"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CircleDot, Loader2, GitPullRequest, GitMerge } from "lucide-react";

interface Stats {
  total: number;
  inProgress: number;
  prCreated: number;
  merged: number;
}

export function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "전체 이슈", value: stats.total, icon: CircleDot, accent: "text-foreground", bg: "bg-muted" },
    { label: "진행 중", value: stats.inProgress, icon: Loader2, accent: "text-yellow-400", bg: "bg-yellow-400/10" },
    { label: "PR 생성됨", value: stats.prCreated, icon: GitPullRequest, accent: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "머지됨", value: stats.merged, icon: GitMerge, accent: "text-green-400", bg: "bg-green-400/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} aria-label={`${card.label}: ${card.value}건`}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`rounded-lg p-2.5 ${card.bg} ${card.accent}`} aria-hidden="true">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
