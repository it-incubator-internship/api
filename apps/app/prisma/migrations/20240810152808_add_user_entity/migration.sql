-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('CONFIRM', 'NOT_CONFIRM');

-- CreateEnum
CREATE TYPE "BanStatus" AS ENUM ('BANNED', 'NOT_BANNED');

-- CreateTable
CREATE TABLE "accountData" (
    "profileId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'NOT_CONFIRM',
    "confirmationCode" TEXT NOT NULL,
    "recoveryCode" TEXT,
    "banStatus" "BanStatus" NOT NULL DEFAULT 'NOT_BANNED',
    "banDate" TIMESTAMP(3),

    CONSTRAINT "accountData_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "deviceName" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "lastActiveDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "accountData"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
