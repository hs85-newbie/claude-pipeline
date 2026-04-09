/**
 * AI Provider 추상화 인터페이스
 * @description 각 AI Provider(Claude, Codex 등)가 구현해야 할 공통 계약
 */

export const AI_PROVIDER = {
  CLAUDE: "CLAUDE",
  CODEX: "CODEX",
} as const;

export type AiProviderType = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

/** dispatch 시 GitHub Actions에 전달할 inputs */
export interface DispatchInputs {
  issue_id: string;
  task: string;
  issue_type: string;
  callback_url: string;
  [key: string]: string;
}

/** Provider가 온보딩 시 안내할 필수 Secret 정보 */
export interface RequiredSecret {
  name: string;
  description: string;
  /** 사용자에게 보여줄 발급 가이드 URL */
  guideUrl?: string;
}

export interface AiProvider {
  /** Provider 식별자 */
  readonly type: AiProviderType;
  /** UI 표시용 이름 */
  readonly displayName: string;
  /** UI 표시용 설명 */
  readonly description: string;
  /** 대상 워크플로우 파일명 */
  readonly workflowFileName: string;

  /**
   * dispatch용 task 설명문 생성
   * @param issue - 이슈 정보 (title, description, id, type)
   * @returns task 설명문
   */
  buildTaskDescription(issue: {
    id: string;
    title: string;
    description: string | null;
    type: string;
  }): string;

  /**
   * GitHub Actions workflow_dispatch에 전달할 inputs 구성
   * @param issue - 이슈 정보
   * @param callbackUrl - webhook 콜백 URL
   * @returns dispatch inputs 객체
   */
  buildDispatchInputs(
    issue: {
      id: string;
      title: string;
      description: string | null;
      type: string;
    },
    callbackUrl: string,
  ): DispatchInputs;

  /** 온보딩 시 안내할 필수 Secrets 목록 */
  getRequiredSecrets(): RequiredSecret[];
}
