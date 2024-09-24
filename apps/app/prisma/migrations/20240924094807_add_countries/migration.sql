-- CreateTable
CREATE TABLE "profile" (
    "profileId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "country" TEXT,
    "city" TEXT,
    "aboutMe" TEXT,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("profileId")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_profileId_key" ON "profile"("profileId");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
