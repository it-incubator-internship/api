-- DropForeignKey
ALTER TABLE "profile" DROP CONSTRAINT "profile_id_fkey";

-- AddForeignKey
ALTER TABLE "accountData" ADD CONSTRAINT "accountData_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
