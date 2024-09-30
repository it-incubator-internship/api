/*
  Warnings:

  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[parentId]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entity` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentId` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('GALLERY', 'PROFILE');

-- DropIndex
DROP INDEX "events_profileId_key";

-- AlterTable
ALTER TABLE "events" DROP CONSTRAINT "events_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "profileId",
ADD COLUMN     "entity" "Entity" NOT NULL,
ADD COLUMN     "parentId" UUID NOT NULL,
ADD COLUMN     "proccesingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "events_parentId_key" ON "events"("parentId");
