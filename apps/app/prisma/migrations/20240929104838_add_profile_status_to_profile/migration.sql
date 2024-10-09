/*
  Warnings:

  - Added the required column `profileStatus` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('READY', 'PENDING');

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "profileStatus" "ProfileStatus" NOT NULL;
