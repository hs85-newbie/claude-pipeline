import { prisma } from "./prisma";
import { getProvider } from "./providers";
import type { AiProviderType } from "./providers";

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

  // WHY: Issue.targetBranch가 지정되어 있으면 우선 사용, 없으면 프로젝트 기본 브랜치
  const ref = issue.targetBranch ?? defaultBranch;

  // WHY: Project.provider 필드 기반으로 AI Provider 분기
  const aiProvider = getProvider(issue.project.provider as AiProviderType);
  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/github`;
  const inputs = aiProvider.buildDispatchInputs(issue, callbackUrl);

  const response = await fetch(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/actions/workflows/${aiProvider.workflowFileName}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref, inputs }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(`[Dispatch] GitHub API 실패 (${response.status}):`, text);

    if (response.status === 404) {
      throw new Error(`워크플로우 파일(${aiProvider.workflowFileName})이 레포에 없습니다. 템플릿을 먼저 설정해주세요.`);
    }
    throw new Error("GitHub Actions 실행에 실패했습니다.");
  }

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
