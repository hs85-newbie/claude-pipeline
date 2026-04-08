"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, ExternalLink } from "lucide-react";
import type { OnboardingState } from "./onboarding-wizard";

// WHY: MVP에서는 Secrets 자동등록 미구현 — 체크리스트 UI로 안내
// Phase 2에서 GitHub API로 자동 등록 구현 예정
const SECRETS = [
  {
    name: "CLAUDE_CODE_OAUTH_TOKEN",
    description: "Claude Code 인증 토큰 (claude.ai에서 발급)",
    helpUrl: "https://docs.anthropic.com",
  },
  {
    name: "PIPELINE_API_KEY",
    description: "파이프라인 API 키 (설정 페이지에서 생성)",
    helpUrl: null,
  },
] as const;

interface Props {
  state: OnboardingState;
  onNext: () => void;
}

export function StepSecrets({ state, onNext }: Props) {
  const repoUrl = state.selectedRepo
    ? `https://github.com/${state.selectedRepo.owner}/${state.selectedRepo.name}/settings/secrets/actions`
    : "#";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          GitHub Secrets 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          파이프라인이 정상 동작하려면 아래 Secrets를 레포에 등록해야 합니다.
          <br />
          대시보드에서 나중에 설정할 수도 있습니다.
        </p>

        <div className="space-y-3">
          {SECRETS.map((secret) => (
            <div
              key={secret.name}
              className="flex items-start gap-3 rounded-lg border border-border p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono font-medium">
                  {secret.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {secret.description}
                </p>
              </div>
              {secret.helpUrl && (
                <a
                  href={secret.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>

        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          GitHub Secrets 설정 페이지 열기
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="flex justify-end">
          <Button onClick={onNext}>다음</Button>
        </div>
      </CardContent>
    </Card>
  );
}
