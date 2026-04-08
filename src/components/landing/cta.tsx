"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight">
          5분 안에 시작하기
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          GitHub 계정만 있으면 됩니다.
          <br />
          이슈 하나 남기고, AI가 일하는 걸 지켜보세요.
        </p>
        <Link href="/auth/signin" className="mt-8 inline-block">
          <Button size="lg" className="gap-2">
            GitHub로 시작하기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
