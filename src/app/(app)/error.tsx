"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-[hsl(var(--warning))]" />
          <h2 className="mt-4 text-lg font-semibold">
            문제가 발생했습니다
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
            <Link href="/dashboard">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                대시보드로
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
