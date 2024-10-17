/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `profile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('READY', 'PENDING', 'REJECT');

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "avatarUrl",
ADD COLUMN     "originalAvatarUrl" TEXT,
ADD COLUMN     "smallAvatarUrl" TEXT;

-- CreateTable
CREATE TABLE "events" (
    "profileId" UUID NOT NULL,
    "eventStatus" "EventStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("profileId")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_profileId_key" ON "events"("profileId");
