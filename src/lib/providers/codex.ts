import type { AiProvider, DispatchInputs, RequiredSecret } from "./types";
import { AI_PROVIDER } from "./types";

/**
 * OpenAI Codex AI Provider
 * @description OpenAI Codex CLI 기반 자동화
 */
export const codexProvider: AiProvider = {
  type: AI_PROVIDER.CODEX,
  displayName: "OpenAI Codex",
  description: "OpenAI Codex CLI — GitHub Actions 기반 자동화",
  workflowFileName: "pipeai-codex.yml",
  beta: true,
  betaNotice:
    "OpenAI Codex Provider는 Beta입니다. 출력 품질 편차, CLI 스펙 변경 가능성, 일부 작업 실패 가능성이 있을 수 있습니다. 프로덕션 워크로드는 Claude Provider를 권장합니다.",

  buildTaskDescription(issue) {
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
        name: "OPENAI_API_KEY",
        description: "OpenAI API 키 (platform.openai.com에서 발급)",
        guideUrl: "https://platform.openai.com/api-keys",
      },
      {
        name: "PIPELINE_API_KEY",
        description: "PipeAI 서버 인증 키 (설정 페이지에서 발급)",
      },
    ];
  },
};
