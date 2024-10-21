/*
  Warnings:

  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `events` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "events_parentId_key";

-- AlterTable
ALTER TABLE "events" DROP CONSTRAINT "events_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");
