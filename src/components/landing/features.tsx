"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, GitBranch, LayoutDashboard } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI 코드 에이전트",
    description:
      "Claude가 이슈를 분석하고, 코드를 수정하고, 커밋까지 자동으로. 브랜치 생성부터 PR 머지까지 전체 프로세스를 처리합니다.",
  },
  {
    icon: GitBranch,
    title: "GitHub 네이티브",
    description:
      "GitHub Actions 위에서 동작하므로 추가 인프라가 필요 없습니다. 기존 워크플로우를 그대로 유지하면서 자동화를 더합니다.",
  },
  {
    icon: LayoutDashboard,
    title: "관제탑 대시보드",
    description:
      "모든 프로젝트의 이슈 상태를 한 곳에서 추적하세요. 파이프라인 단계, PR 상태, 승인 대기 건을 실시간으로 확인합니다.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            왜 Claude Pipeline인가요?
          </h2>
          <p className="mt-3 text-muted-foreground">
            기존 인프라를 활용해서 비용은 최소로, 자동화는 최대로
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
