"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* 그라데이션 배경 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        {/* 헤드라인 */}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            코드 수정부터 PR 머지까지
          </span>
        </h1>

        {/* 서브텍스트 */}
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          GitHub + Claude = 자율 개발 파이프라인.
          <br />
          이슈만 남기면 AI가 코드 분석, 수정, PR 생성까지 자동으로.
        </p>

        {/* CTA */}
        <div className="mt-8 flex items-center gap-4">
          <Link href="/auth/signin">
            <Button size="lg" className="gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              자세히 보기
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          무료로 시작 — 신용카드 불필요
        </p>
      </motion.div>

      {/* 터미널 데모 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 w-full max-w-2xl"
      >
        <div className="rounded-lg border border-border bg-card p-1">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
            <span className="ml-2 text-xs text-muted-foreground">
              Paperclip Issue
            </span>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="text-muted-foreground">
              <span className="text-green-400">$</span> 이슈 생성:
            </div>
            <div className="mt-2 text-foreground">
              <span className="text-primary">[tms:dev]</span> STT 엔진을 Clova로
              변경
            </div>
            <div className="mt-4 text-muted-foreground">───</div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse-glow rounded-full bg-primary" />
              <span className="text-muted-foreground">AI 분석 중...</span>
            </div>
            <div className="mt-2 text-green-400">
              ✓ 코드 수정 완료 — page.tsx (+15, -53)
            </div>
            <div className="mt-1 text-green-400">✓ PR #8 생성 완료</div>
            <div className="mt-1 text-green-400">✓ 리뷰 대기 → 승인 → 머지</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
