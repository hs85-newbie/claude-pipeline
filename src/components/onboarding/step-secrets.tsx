"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, ExternalLink } from "lucide-react";
import { getProvider } from "@/lib/providers";
import type { OnboardingState } from "./onboarding-wizard";

interface Props {
  state: OnboardingState;
  onNext: () => void;
}

export function StepSecrets({ state, onNext }: Props) {
  // WHY: Provider별 필수 Secrets가 다름 — 선택된 Provider 기반으로 동적 표시
  const provider = getProvider(state.provider);
  const secrets = provider.getRequiredSecrets();

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
          <span className="font-medium text-foreground">
            {provider.displayName}
          </span>{" "}
          파이프라인이 정상 동작하려면 아래 Secrets를 레포에 등록해야 합니다.
          <br />
          대시보드에서 나중에 설정할 수도 있습니다.
        </p>

        <div className="space-y-3">
          {secrets.map((secret) => (
            <div
              key={secret.name}
              className="flex items-start gap-3 rounded-lg border border-border p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-mono font-medium">{secret.name}</p>
                <p className="text-xs text-muted-foreground">
                  {secret.description}
                </p>
              </div>
              {secret.guideUrl && (
                <a
                  href={secret.guideUrl}
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
