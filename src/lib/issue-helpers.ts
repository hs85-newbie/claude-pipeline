import type { IssueStatus, IssuePriority, PipelineStage } from "@prisma/client";

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string }> = {
  OPEN: { label: "열림", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  IN_PROGRESS: { label: "진행 중", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  PR_CREATED: { label: "PR 생성됨", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  MERGED: { label: "머지됨", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  CLOSED: { label: "닫힘", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string }> = {
  LOW: { label: "낮음", color: "text-gray-400" },
  MEDIUM: { label: "보통", color: "text-blue-400" },
  HIGH: { label: "높음", color: "text-orange-400" },
  CRITICAL: { label: "긴급", color: "text-red-400" },
};

export const PIPELINE_CONFIG: Record<PipelineStage, { label: string; icon: string }> = {
  QUEUED: { label: "대기", icon: "⏳" },
  ANALYZING: { label: "분석 중", icon: "🔍" },
  CODING: { label: "코딩 중", icon: "💻" },
  PR_REVIEW: { label: "PR 리뷰", icon: "📝" },
  MERGED: { label: "완료", icon: "✅" },
  FAILED: { label: "실패", icon: "❌" },
};

/**
 * 상대 시간 포맷
 * @param date - ISO 날짜 문자열 또는 Date 객체
 * @returns "방금 전", "3분 전", "2시간 전" 등
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 30) return `${diffDay}일 전`;
  return target.toLocaleDateString("ko-KR");
}
