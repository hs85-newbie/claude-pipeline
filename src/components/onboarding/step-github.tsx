"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, GitBranch } from "lucide-react";
import type { OnboardingState } from "./onboarding-wizard";

interface Props {
  state: OnboardingState;
  onNext: () => void;
}

export function StepGithub({ state, onNext }: Props) {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );

  useEffect(() => {
    // WHY: OAuth 로그인 완료 시점에서 이미 GitHub 연결됨 — githubLogin 존재 확인만
    if (state.githubLogin) {
      const timer = setTimeout(() => setStatus("connected"), 800);
      return () => clearTimeout(timer);
    }
    setStatus("error");
  }, [state.githubLogin]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          GitHub 계정 연결 확인
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          {status === "checking" && (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <p className="font-medium">연결 확인 중...</p>
                <p className="text-sm text-muted-foreground">
                  GitHub 계정 상태를 확인하고 있습니다.
                </p>
              </div>
            </>
          )}
          {status === "connected" && (
            <>
              <CheckCircle2 className="h-6 w-6 text-[hsl(var(--success))]" />
              <div>
                <p className="font-medium">
                  연결됨 — @{state.githubLogin}
                </p>
                <p className="text-sm text-muted-foreground">
                  GitHub 계정이 정상적으로 연결되어 있습니다.
                </p>
              </div>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-medium">연결 실패</p>
                <p className="text-sm text-muted-foreground">
                  GitHub 계정을 다시 연결해주세요.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext} disabled={status !== "connected"}>
            다음
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
