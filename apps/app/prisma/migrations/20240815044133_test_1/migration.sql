/*
  Warnings:

  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "accountData" DROP CONSTRAINT "accountData_profileId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_profileId_fkey";

-- DropTable
DROP TABLE "profile";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "banStatus" "BanStatus" NOT NULL DEFAULT 'NOT_BANNED',
    "banDate" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "accountData" ADD CONSTRAINT "accountData_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
