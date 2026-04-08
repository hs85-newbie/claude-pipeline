"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2, CheckCircle2 } from "lucide-react";
import type { OnboardingState } from "./onboarding-wizard";

interface Props {
  state: OnboardingState;
  onComplete: () => void;
}

export function StepComplete({ state, onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      const json = await res.json();

      if (json.error) {
        setError(json.error.message);
        return;
      }

      onComplete();
    } catch (err) {
      console.error("[Onboarding] 완료 처리 실패:", err);
      setError("온보딩을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          설정 완료
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[hsl(var(--success))]" />
          <h3 className="mt-4 text-lg font-semibold">모든 준비가 완료되었습니다!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {state.selectedRepo?.fullName}
            </span>
            {" "}레포에 파이프라인이 연결됩니다.
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>대시보드에서 할 수 있는 것:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>이슈를 생성하면 AI가 자동으로 코드를 수정합니다</li>
            <li>PR 생성 후 검토/승인할 수 있습니다</li>
            <li>파이프라인 진행 상태를 실시간으로 추적합니다</li>
          </ul>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-end">
          <Button onClick={handleFinish} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            대시보드로 이동
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
