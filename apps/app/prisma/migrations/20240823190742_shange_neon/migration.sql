/*
  Warnings:

  - You are about to drop the column `deviceUuid` on the `session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "session_deviceUuid_key";

-- AlterTable
ALTER TABLE "session" DROP COLUMN "deviceUuid";
