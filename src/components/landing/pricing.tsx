"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "무료",
    description: "시작하기에 충분합니다",
    features: [
      "프로젝트 1개",
      "월 50회 디스패치",
      "기본 파이프라인",
      "커뮤니티 지원",
    ],
    cta: "무료로 시작",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/월",
    description: "무제한으로 자동화하세요",
    badge: "추천",
    features: [
      "프로젝트 무제한",
      "디스패치 무제한",
      "야간 cron 자동화",
      "우선 지원",
      "고급 파이프라인 설정",
    ],
    cta: "Pro 시작하기",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$19",
    period: "/월/인",
    description: "팀과 함께 사용하세요",
    features: [
      "Pro의 모든 기능",
      "멀티 유저",
      "승인 권한 관리",
      "감사 로그",
      "전용 지원",
    ],
    cta: "출시 예정",
    highlighted: false,
    disabled: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            심플한 가격 정책
          </h2>
          <p className="mt-3 text-muted-foreground">
            무료로 시작하고, 필요할 때 업그레이드하세요
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`relative h-full ${
                  plan.highlighted
                    ? "border-primary bg-card shadow-lg shadow-primary/5"
                    : "border-border bg-card/50"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signin" className="mt-6 block">
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      disabled={plan.disabled}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
