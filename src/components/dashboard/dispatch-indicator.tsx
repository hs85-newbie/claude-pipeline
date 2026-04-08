"use client";

import { Loader2, Zap } from "lucide-react";

interface Props {
  activeCount: number;
}

/**
 * dispatch 실행 중 상단 인디케이터
 * activeCount가 0이면 렌더링하지 않음
 */
export function DispatchIndicator({ activeCount }: Props) {
  if (activeCount === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <Zap className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-primary">
        파이프라인 실행 중 — {activeCount}건 처리 중
      </span>
    </div>
  );
}
