import { prisma } from "./prisma";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
  description: string | null;
  language: string | null;
  updated_at: string;
}

/**
 * GitHub API에서 사용자의 레포 목록 조회
 * @param userId - DB 사용자 ID
 * @returns 레포 목록 (최근 업데이트 순)
 * @throws {Error} access_token이 없거나 GitHub API 실패 시
 */
export async function getUserRepos(userId: string): Promise<GitHubRepo[]> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    throw new Error("GitHub access token을 찾을 수 없습니다.");
  }

  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  // WHY: GitHub API는 페이지네이션 필수 — 최대 3페이지(300개)까지만 조회
  while (page <= 3) {
    const response = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`);
    }

    const data: GitHubRepo[] = await response.json();
    repos.push(...data);

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

/**
 * GitHub access token 유효성 확인
 * @param userId - DB 사용자 ID
 * @returns 유효하면 GitHub 사용자 정보, 아니면 null
 */
export async function verifyGitHubToken(
  userId: string
): Promise<{ login: string; avatar_url: string } | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) return null;

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return { login: data.login, avatar_url: data.avatar_url };
  } catch (error) {
    console.error("[GitHub] 토큰 검증 실패:", error);
    return null;
  }
}
