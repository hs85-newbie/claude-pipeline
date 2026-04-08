import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // WHY: 미들웨어는 Edge Runtime에서 실행되는데 Prisma는 Edge 미지원
  // JWT 전략을 사용하면 미들웨어에서 DB 조회 없이 토큰만으로 인증 가능
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // WHY: 첫 로그인 시 user 객체가 있음 → JWT에 필요한 정보 저장
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === "github" && profile) {
        token.githubLogin = (profile as { login?: string }).login;
        token.githubId = String(profile.id);

        // GitHub 프로필 데이터를 DB에 저장하고 onboarded 상태 조회
        if (user?.id) {
          const dbUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              githubId: String(profile.id),
              githubLogin: (profile as { login?: string }).login,
            },
          });
          token.onboarded = dbUser.onboarded;
        }
      }

      // WHY: 온보딩 완료 후 session update 호출 시 DB에서 최신 onboarded 갱신
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboarded: true },
        });
        if (dbUser) token.onboarded = dbUser.onboarded;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.githubLogin = token.githubLogin as string | undefined;
        // WHY: onboarded는 JWT에 캐시, 서버 컴포넌트에서 DB 조회로 최신화
        session.user.onboarded = (token.onboarded as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
