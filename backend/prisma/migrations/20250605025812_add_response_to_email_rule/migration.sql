/*
  Warnings:

  - Added the required column `response` to the `EmailRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailRule" ADD COLUMN     "response" TEXT NOT NULL;
