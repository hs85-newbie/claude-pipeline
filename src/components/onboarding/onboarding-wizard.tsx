"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StepGithub } from "./step-github";
import { StepRepo } from "./step-repo";
import { StepSecrets } from "./step-secrets";
import { StepComplete } from "./step-complete";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "GitHub 연결" },
  { id: 2, label: "레포 선택" },
  { id: 3, label: "Secrets 확인" },
  { id: 4, label: "완료" },
] as const;

export interface OnboardingState {
  githubLogin: string;
  selectedRepo: {
    owner: string;
    name: string;
    fullName: string;
    defaultBranch: string;
  } | null;
  projectId: string | null;
}

export function OnboardingWizard({ githubLogin }: { githubLogin: string }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<OnboardingState>({
    githubLogin,
    selectedRepo: null,
    projectId: null,
  });

  const progress = (currentStep / STEPS.length) * 100;

  function handleNext() {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleComplete() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* 스텝 인디케이터 */}
      <div className="mb-8">
        <div className="mb-4 flex justify-between">
          {STEPS.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step.id
                      ? "bg-[hsl(var(--success))] text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  currentStep === step.id
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* 스텝 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && (
            <StepGithub state={state} onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <StepRepo
              state={state}
              setState={setState}
              onNext={handleNext}
            />
          )}
          {currentStep === 3 && (
            <StepSecrets state={state} onNext={handleNext} />
          )}
          {currentStep === 4 && (
            <StepComplete state={state} onComplete={handleComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
