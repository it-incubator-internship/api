/*
  Warnings:

  - A unique constraint covering the columns `[deviceUuid]` on the table `session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "session_deviceUuid_key" ON "session"("deviceUuid");
