import type { AiProvider, DispatchInputs, RequiredSecret } from "./types";
import { AI_PROVIDER } from "./types";

/**
 * Claude Code AI Provider
 * @description Paperclip 오케스트레이터 기반 Claude Code 실행
 */
export const claudeProvider: AiProvider = {
  type: AI_PROVIDER.CLAUDE,
  displayName: "Claude Code",
  description: "Anthropic Claude Code — Paperclip 오케스트레이터 기반 자동화",
  workflowFileName: "pipeai-dispatch.yml",

  buildTaskDescription(issue) {
    // WHY: 분석은 ANALYSIS 파일만 생성, 코드 수정 금지
    if (issue.type === "ANALYSIS") {
      return `[분석] ${issue.title}. 상세: ${issue.description ?? "없음"}. docs/ANALYSIS-${issue.id}.md 파일로 결과를 작성하세요. 코드 수정 금지.`;
    }
    return `${issue.title}. 상세: ${issue.description ?? "없음"}`;
  },

  buildDispatchInputs(issue, callbackUrl): DispatchInputs {
    return {
      issue_id: issue.id,
      task: this.buildTaskDescription(issue),
      issue_type: issue.type,
      callback_url: callbackUrl,
    };
  },

  getRequiredSecrets(): RequiredSecret[] {
    return [
      {
        name: "CLAUDE_CODE_OAUTH_TOKEN",
        description: "Claude Code 인증 토큰 (claude.ai에서 발급)",
        guideUrl: "https://docs.anthropic.com/en/docs/claude-code",
      },
      {
        name: "PIPELINE_API_KEY",
        description: "PipeAI 서버 인증 키 (설정 페이지에서 발급)",
      },
    ];
  },
};
