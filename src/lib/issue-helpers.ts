import type { IssueStatus, IssuePriority, IssueType, PipelineStage, CloseReason } from "@prisma/client";

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; description: string }> = {
  OPEN: { label: "대기 중", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", description: "파이프라인 실행 대기" },
  IN_PROGRESS: { label: "진행 중", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", description: "AI가 코드 수정 중" },
  PR_CREATED: { label: "PR 생성됨", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", description: "리뷰 대기 중" },
  MERGED: { label: "완료", color: "bg-green-500/20 text-green-400 border-green-500/30", description: "PR 머지 완료" },
  CLOSED: { label: "취소됨", color: "bg-red-500/20 text-red-400 border-red-500/30", description: "수동 취소 또는 불필요" },
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

export const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; description: string }> = {
  CODE_FIX: { label: "코드 수정", description: "AI가 코드를 수정하고 PR을 생성합니다" },
  ANALYSIS: { label: "분석", description: "코드를 분석하고 ANALYSIS 파일을 생성합니다 (자동 머지)" },
};

// WHY: 제목에 분석 관련 키워드가 있으면 자동으로 ANALYSIS 유형으로 판단
const ANALYSIS_KEYWORDS = ["점검", "분석", "제안", "검토"];

/**
 * 제목 기반 이슈 유형 자동 판단
 * @param title - 이슈 제목
 * @returns 추천 유형
 */
export function detectIssueType(title: string): IssueType {
  return ANALYSIS_KEYWORDS.some((kw) => title.includes(kw)) ? "ANALYSIS" : "CODE_FIX";
}

export const CLOSE_REASON_CONFIG: Record<CloseReason, { label: string; color: string }> = {
  USER_CANCELLED: { label: "사용자 취소", color: "text-gray-400" },
  PIPELINE_FAILED: { label: "파이프라인 실패", color: "text-red-400" },
  DUPLICATE: { label: "중복 이슈", color: "text-orange-400" },
  WONT_FIX: { label: "수정 불필요", color: "text-gray-400" },
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
