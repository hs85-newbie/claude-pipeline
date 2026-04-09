"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllProviders } from "@/lib/providers";
import type { AiProviderType } from "@/lib/providers";
import type { OnboardingState } from "./onboarding-wizard";

interface Props {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  onNext: () => void;
}

const providers = getAllProviders();

export function StepProvider({ state, setState, onNext }: Props) {
  function handleSelect(type: AiProviderType) {
    setState((prev) => ({ ...prev, provider: type }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          AI Provider 선택
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          파이프라인에서 사용할 AI를 선택하세요. 나중에 프로젝트 설정에서 변경할
          수 있습니다.
        </p>

        <div className="space-y-2">
          {providers.map((p) => {
            const isSelected = state.provider === p.type;
            return (
              <button
                key={p.type}
                type="button"
                onClick={() => handleSelect(p.type)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors",
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-accent"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{p.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={!state.provider}>
            다음
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
