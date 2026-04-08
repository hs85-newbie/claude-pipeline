-- CreateEnum
CREATE TYPE "CloseReason" AS ENUM ('USER_CANCELLED', 'PIPELINE_FAILED', 'DUPLICATE', 'WONT_FIX');

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "closeReason" "CloseReason";
