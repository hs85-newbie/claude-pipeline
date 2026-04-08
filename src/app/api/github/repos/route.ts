import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRepos } from "@/lib/github";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { data: null, error: { code: "UNAUTHORIZED", message: "로그인이 필요합니다." } },
      { status: 401 }
    );
  }

  try {
    const repos = await getUserRepos(session.user.id);

    const data = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private,
      description: repo.description,
      language: repo.language,
      updatedAt: repo.updated_at,
    }));

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("[API] GitHub repos 조회 실패:", error);
    return NextResponse.json(
      { data: null, error: { code: "GITHUB_ERROR", message: "레포 목록을 불러올 수 없습니다." } },
      { status: 502 }
    );
  }
}
