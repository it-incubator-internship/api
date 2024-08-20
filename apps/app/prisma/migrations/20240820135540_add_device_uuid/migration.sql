-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('CONFIRM', 'NOT_CONFIRM');

-- CreateEnum
CREATE TYPE "BanStatus" AS ENUM ('BANNED', 'NOT_BANNED');

-- CreateTable
CREATE TABLE "accountData" (
    "profileId" UUID NOT NULL,
    "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'NOT_CONFIRM',
    "confirmationCode" TEXT NOT NULL,
    "recoveryCode" TEXT,

    CONSTRAINT "accountData_pkey" PRIMARY KEY ("profileId")
);

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

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "profileId" UUID NOT NULL,
    "deviceUuid" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "lastActiveDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accountData_profileId_key" ON "accountData"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "accountData" ADD CONSTRAINT "accountData_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
