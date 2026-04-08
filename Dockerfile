# WHY: Railway는 Dockerfile 또는 Nixpacks 빌드 지�� — standalone 모드로 최적화
FROM node:20-alpine AS base

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate + Next.js 빌드 (migrate는 런타임에 실행)
RUN pnpm prisma generate
RUN pnpm next build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# standalone 출�� 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

# WHY: migrate deploy를 시작 전에 실행하여 DB 스키마 자동 반영
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
