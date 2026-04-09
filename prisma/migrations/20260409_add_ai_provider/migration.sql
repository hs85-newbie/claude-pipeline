-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('CLAUDE', 'CODEX');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "provider" "AiProvider" NOT NULL DEFAULT 'CLAUDE';
