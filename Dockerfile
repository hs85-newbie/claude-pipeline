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

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# standalone + static + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# WHY: pnpm 심볼릭 링크 구조 대신 node_modules 전체 복사 후 정리
COPY --from=builder /app/node_modules ./node_modules

USER appuser
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
