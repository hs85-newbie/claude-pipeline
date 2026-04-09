-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('CODE_FIX', 'ANALYSIS');

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "type" "IssueType" NOT NULL DEFAULT 'CODE_FIX';
