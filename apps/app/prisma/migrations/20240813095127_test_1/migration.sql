/*
  Warnings:

  - A unique constraint covering the columns `[profileId]` on the table `accountData` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "accountData_profileId_key" ON "accountData"("profileId");

-- AddForeignKey
ALTER TABLE "accountData" ADD CONSTRAINT "accountData_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
