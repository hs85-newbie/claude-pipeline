import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Zap,
  Shield,
  HelpCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">문서</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PipeAI를 시작하고 활용하는 방법을 안내합니다.
        </p>
      </div>

      {/* 시작 가이드 */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Rocket className="h-5 w-5 text-primary" />
          시작 가이드
        </h2>
        <div className="space-y-3">
          <StepCard
            step={1}
            title="GitHub로 로그인"
            description="GitHub OAuth로 로그인합니다. 레포 접근 권한(repo 스코프)이 필요합니다."
          />
          <StepCard
            step={2}
            title="레포 연결"
            description="온보딩 위자드에서 파이프라인을 연결할 GitHub 레포를 선택합니다."
          />
          <StepCard
            step={3}
            title="AI Provider 선택 + Secrets 설정"
            description="Claude Code 또는 OpenAI Codex 중 선택하고, 해당 Provider의 Secrets를 레포에 등록합니다."
          />
          <StepCard
            step={4}
            title="이슈 생성"
            description="대시보드에서 이슈를 생성하면 AI가 자동으로 코드를 분석하고 수정합니다."
          />
          <StepCard
            step={5}
            title="PR 검토 및 머지"
            description="AI가 생성한 PR을 확인하고, 문제가 없으면 승인하여 머지합니다."
          />
        </div>
      </section>

      {/* 파이프라인 설명 */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          파이프라인 동작 원리
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <PipelineStep
                icon="⏳"
                stage="대기 (QUEUED)"
                description="이슈가 생성되면 파이프라인 큐에 등록됩니다."
              />
              <PipelineArrow />
              <PipelineStep
                icon="🔍"
                stage="분석 (ANALYZING)"
                description="AI가 이슈 내용을 분석하고, 관련 코드 파일을 식별합니다."
              />
              <PipelineArrow />
              <PipelineStep
                icon="💻"
                stage="코딩 (CODING)"
                description="선택한 AI Provider가 GitHub Actions에서 실행되어 코드를 수정합니다."
              />
              <PipelineArrow />
              <PipelineStep
                icon="📝"
                stage="PR 리뷰 (PR_REVIEW)"
                description="수정 완료 후 Pull Request가 자동 생성됩니다. 사용자가 검토합니다."
              />
              <PipelineArrow />
              <PipelineStep
                icon="✅"
                stage="완료 (MERGED)"
                description="승인 후 PR이 머지되면 파이프라인이 완료됩니다."
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Secrets 상세 */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-5 w-5 text-primary" />
          Secrets 설정 가이드
        </h2>

        <p className="mb-4 text-sm text-muted-foreground">
          모든 Provider에 공통으로 필요한 Secret과, Provider별 전용 Secret이
          있습니다.
        </p>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">공통 (모든 Provider)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                PIPELINE_API_KEY
              </code>
              <p>PipeAI 서버 인증 키. 설정 페이지에서 발급 후 레포 Secrets에 등록.</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Claude Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  CLAUDE_CODE_OAUTH_TOKEN
                </code>
                <p>Claude Code 인증 OAuth 토큰.</p>
                <ol className="ml-4 list-decimal space-y-1">
                  <li>claude.ai에 로그인</li>
                  <li>설정 → API → 토큰 발급</li>
                  <li>레포 Settings → Secrets → Actions에 등록</li>
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  OpenAI Codex
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-medium">
                    BETA
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  OPENAI_API_KEY
                </code>
                <p>OpenAI API 키.</p>
                <ol className="ml-4 list-decimal space-y-1">
                  <li>platform.openai.com에 로그인</li>
                  <li>API Keys → Create new secret key</li>
                  <li>레포 Settings → Secrets → Actions에 등록</li>
                </ol>
                <p className="mt-2 text-xs text-amber-500">
                  ⚠️ Beta: 출력 품질 편차 가능. 프로덕션은 Claude 권장.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <HelpCircle className="h-5 w-5 text-primary" />
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          <FaqItem
            question="무료 플랜으로 무엇을 할 수 있나요?"
            answer="프로젝트 1개, 월 50회 파이프라인 실행이 가능합니다. 소규모 프로젝트나 테스트 용도로 충분합니다."
          />
          <FaqItem
            question="GitHub Actions 비용이 발생하나요?"
            answer="Public 레포는 무료입니다. Private 레포는 GitHub 계정의 Actions 무료 시간(월 2,000분)을 사용합니다."
          />
          <FaqItem
            question="AI가 자동으로 코드를 머지하나요?"
            answer="아닙니다. AI는 PR을 생성하기만 하고, 머지는 반드시 사용자가 검토 후 승인해야 합니다. 안전망이 내장되어 있습니다."
          />
          <FaqItem
            question="어떤 AI Provider를 지원하나요?"
            answer="현재 Claude Code와 OpenAI Codex를 지원합니다. 프로젝트 설정에서 언제든 변경할 수 있으며, 각 Provider가 지원하는 모든 프로그래밍 언어를 사용할 수 있습니다."
          />
          <FaqItem
            question="파이프라인이 실패하면 어떻게 되나요?"
            answer="이슈 상태가 'FAILED'로 변경되고, 실패 원인이 코멘트로 기록됩니다. 이슈를 수정하거나 재실행할 수 있습니다."
          />
          <FaqItem
            question="Secrets가 안전한가요?"
            answer="Secrets는 GitHub Actions의 암호화된 저장소에 보관됩니다. 로그에 노출되지 않으며, 포크된 레포에서 접근할 수 없습니다."
          />
        </div>
      </section>

      {/* 추가 리소스 */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          추가 리소스
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <ResourceLink
            title="GitHub 레포"
            description="소스 코드와 이슈 트래커"
            href="https://github.com/hs85-newbie/claude-pipeline"
          />
          <ResourceLink
            title="Claude Code 문서"
            description="Claude Code 공식 문서"
            href="https://docs.anthropic.com"
          />
          <ResourceLink
            title="GitHub Actions 문서"
            description="워크플로우 설정 가이드"
            href="https://docs.github.com/actions"
          />
        </div>
      </section>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          {step}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineStep({
  icon,
  stage,
  description,
}: {
  icon: string;
  stage: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium">{stage}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex justify-center">
      <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium">{question}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  );
}

function ResourceLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{title}</p>
            <Badge variant="secondary" className="text-xs">
              외부 링크
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </a>
  );
}
