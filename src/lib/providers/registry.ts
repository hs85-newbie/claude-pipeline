import type { AiProvider, AiProviderType } from "./types";
import { AI_PROVIDER } from "./types";
import { claudeProvider } from "./claude";
import { codexProvider } from "./codex";

const providers: Record<AiProviderType, AiProvider> = {
  [AI_PROVIDER.CLAUDE]: claudeProvider,
  [AI_PROVIDER.CODEX]: codexProvider,
};

/**
 * Provider 타입으로 AiProvider 인스턴스 조회
 * @param type - AI Provider 타입
 * @returns AiProvider 구현체
 * @throws {Error} 미등록 Provider 타입일 때
 */
export function getProvider(type: AiProviderType): AiProvider {
  const provider = providers[type];
  if (!provider) {
    throw new Error(`미등록 AI Provider: ${type}`);
  }
  return provider;
}

/**
 * 등록된 모든 Provider 목록 반환 (UI 선택지용)
 * @returns Provider 배열
 */
export function getAllProviders(): AiProvider[] {
  return Object.values(providers);
}
