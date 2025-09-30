/*
  Warnings:

  - Added the required column `passed` to the `TestCaseResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."TestCaseResult" ADD COLUMN     "expectedOutput" TEXT,
ADD COLUMN     "passed" BOOLEAN NOT NULL;
