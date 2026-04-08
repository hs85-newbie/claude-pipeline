# WHY: Railway는 Dockerfile 빌드 지원 — standalone 모드로 최적화
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm next build

# WHY: pnpm은 .prisma를 깊은 경로에 저장 — flat copy용 스테이지 추가
RUN mkdir -p /prisma-out && \
    cp -r $(find node_modules -path '*/.prisma/client' -type d | head -1)/.. /prisma-out/.prisma && \
    cp -r $(find node_modules -path '*/@prisma/client' -type d | head -1)/.. /prisma-out/@prisma

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /prisma-out/.prisma ./node_modules/.prisma
COPY --from=builder /prisma-out/@prisma ./node_modules/@prisma

USER appuser

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
