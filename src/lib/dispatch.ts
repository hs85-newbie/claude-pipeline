import { prisma } from "./prisma";

/**
 * GitHub Actions workflow_dispatch를 트리거하여 파이프라인 실행
 * @param issueId - DB 이슈 ID
 * @returns 성공 여부
 * @throws {Error} 프로젝트/토큰 미설정 또는 GitHub API 실패 시
 */
export async function triggerDispatch(issueId: string): Promise<boolean> {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      project: {
        include: {
          user: {
            include: {
              accounts: {
                where: { provider: "github" },
                select: { access_token: true },
              },
            },
          },
        },
      },
    },
  });

  if (!issue) throw new Error("이슈를 찾을 수 없습니다.");
  if (!issue.project) throw new Error("프로젝트를 찾을 수 없습니다.");

  const accessToken = issue.project.user.accounts[0]?.access_token;
  if (!accessToken) throw new Error("GitHub access token이 없습니다.");

  const { githubOwner, githubRepo, defaultBranch } = issue.project;

  // WHY: 이슈 유형에 따라 프롬프트 분기 — 분석은 ANALYSIS 파일만 생성
  const taskDescription = issue.type === "ANALYSIS"
    ? `[분석] ${issue.title}. 상세: ${issue.description ?? "없음"}. docs/ANALYSIS-${issue.id}.md 파일로 결과를 작성하세요. 코드 수정 금지.`
    : `${issue.title}. 상세: ${issue.description ?? "없음"}`;

  // GitHub Actions workflow_dispatch trigger
  const response = await fetch(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/pipeai-dispatch.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        ref: defaultBranch,
        inputs: {
          issue_id: issue.id,
          task: taskDescription,
          issue_type: issue.type,
          callback_url: `${process.env.NEXTAUTH_URL}/api/webhooks/github`,
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[Dispatch] GitHub API 실패 (${response.status}):`, text);

    // WHY: 워크플로우 파일 미존재 시 친화적 에러 메시지
    if (response.status === 404) {
      throw new Error("워크플로우 파일(pipeai-dispatch.yml)이 레포에 없습니다. 템플릿을 먼저 설정해주세요.");
    }
    throw new Error("GitHub Actions 실행에 실패했습니다.");
  }

  // 이슈 상태를 진행 중으로 전환
  await prisma.issue.update({
    where: { id: issueId },
    data: {
      status: "IN_PROGRESS",
      pipelineStage: issue.type === "ANALYSIS" ? "ANALYZING" : "CODING",
    },
  });

  return true;
}

/**
 * in_progress stuck 이슈 자동 복원 (1시간 초과)
 * @param userId - 사용자 ID (선택, 없으면 전체)
 * @returns 복원된 이슈 수
 */
export async function recoverStuckIssues(userId?: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const where = {
    status: "IN_PROGRESS" as const,
    updatedAt: { lt: oneHourAgo },
    ...(userId ? { project: { userId } } : {}),
  };

  const stuckIssues = await prisma.issue.findMany({ where, select: { id: true } });

  if (stuckIssues.length === 0) return 0;

  await prisma.issue.updateMany({
    where: { id: { in: stuckIssues.map((i) => i.id) } },
    data: {
      status: "OPEN",
      pipelineStage: "QUEUED",
    },
  });

  console.info(`[Dispatch] stuck 이슈 ${stuckIssues.length}건 복원`);
  return stuckIssues.length;
}
