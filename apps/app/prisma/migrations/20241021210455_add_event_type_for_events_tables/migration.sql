/*
  Warnings:

  - Added the required column `eventType` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CREATE', 'DELETE');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "eventType" "EventType" NOT NULL;
