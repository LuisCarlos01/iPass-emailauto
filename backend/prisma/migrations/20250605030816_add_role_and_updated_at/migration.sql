/*
  Warnings:

  - Added the required column `updatedAt` to the `EmailLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailLog" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
