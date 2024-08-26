/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `accountData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `accountData` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deviceUuid]` on the table `session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceUuid` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accountData" ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "googleId" TEXT;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "deviceUuid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "accountData_githubId_key" ON "accountData"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "accountData_googleId_key" ON "accountData"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "session_deviceUuid_key" ON "session"("deviceUuid");
