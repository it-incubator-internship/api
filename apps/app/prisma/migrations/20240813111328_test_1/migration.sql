/*
  Warnings:

  - You are about to drop the column `banDate` on the `accountData` table. All the data in the column will be lost.
  - You are about to drop the column `banStatus` on the `accountData` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `accountData` table. All the data in the column will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `passwordHash` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_authorId_fkey";

-- AlterTable
ALTER TABLE "accountData" DROP COLUMN "banDate",
DROP COLUMN "banStatus",
DROP COLUMN "passwordHash";

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "banDate" TIMESTAMP(3),
ADD COLUMN     "banStatus" "BanStatus" NOT NULL DEFAULT 'NOT_BANNED',
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- DropTable
DROP TABLE "post";

-- DropTable
DROP TABLE "user";
