-- DropForeignKey
ALTER TABLE "accountData" DROP CONSTRAINT "accountData_profileId_fkey";

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "accountData"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;
