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
          Claude Pipeline을 시작하고 활용하는 방법을 안내합니다.
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
            title="Secrets 설정"
            description="레포의 GitHub Actions Secrets에 CLAUDE_CODE_OAUTH_TOKEN과 PIPELINE_API_KEY를 등록합니다."
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
                description="Claude Code가 GitHub Actions에서 실행되어 코드를 수정합니다."
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  CLAUDE_CODE_OAUTH_TOKEN
                </code>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Claude Code 인증에 사용되는 OAuth 토큰입니다.</p>
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
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  PIPELINE_API_KEY
                </code>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>파이프라인 API 인증에 사용되는 키입니다.</p>
              <ol className="ml-4 list-decimal space-y-1">
                <li>설정 페이지 → API 키 → 새 키 생성</li>
                <li>생성된 키 복사 (한 번만 표시됨)</li>
                <li>레포 Settings → Secrets → Actions에 등록</li>
              </ol>
            </CardContent>
          </Card>
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
            question="어떤 프로그래밍 언어를 지원하나요?"
            answer="Claude Code가 지원하는 모든 언어를 사용할 수 있습니다. TypeScript, Python, Go, Rust, Java 등 대부분의 주요 언어가 포함됩니다."
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
