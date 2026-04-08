"use client";

import { motion } from "framer-motion";
import { FileText, Bot, Code, GitPullRequest, CheckCircle2 } from "lucide-react";

const stages = [
  { icon: FileText, label: "이슈 생성", color: "text-muted-foreground", bg: "bg-muted" },
  { icon: Bot, label: "AI 분석", color: "text-primary", bg: "bg-primary/10" },
  { icon: Code, label: "코드 수정", color: "text-primary", bg: "bg-primary/10" },
  { icon: GitPullRequest, label: "PR 생성", color: "text-warning", bg: "bg-yellow-500/10" },
  { icon: CheckCircle2, label: "머지 완료", color: "text-success", bg: "bg-green-500/10" },
];

export function PipelineViz() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          파이프라인이 알아서 처리합니다
        </h2>
        <p className="mt-3 text-muted-foreground">
          이슈 하나로 시작해서 PR 머지까지, 전체 워크플로우를 자동화
        </p>

        {/* 파이프라인 플로우 */}
        <div className="mt-16 flex items-center justify-center gap-2 sm:gap-4">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${stage.bg} sm:h-16 sm:w-16`}
              >
                <stage.icon className={`h-6 w-6 ${stage.color} sm:h-7 sm:w-7`} />
              </div>
              <span className="mt-3 text-xs font-medium text-muted-foreground sm:text-sm">
                {stage.label}
              </span>
              {/* 연결선 */}
              {i < stages.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.15 + 0.2 }}
                  viewport={{ once: true }}
                  className="absolute hidden sm:block"
                  style={{ left: "100%", top: "50%" }}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* 연결 화살표 (모바일에서는 숨김) */}
        <div className="mt-4 hidden items-center justify-center sm:flex">
          {stages.slice(0, -1).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.1 }}
              viewport={{ once: true }}
              className="mx-[26px] h-px w-8 bg-border sm:mx-[30px] sm:w-12"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
