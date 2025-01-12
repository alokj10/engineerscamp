/*
  Warnings:

  - A unique constraint covering the columns `[testId,respondentId]` on the table `TestAccessCodes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TestAccessCodes_testId_respondentId_key` ON `TestAccessCodes`(`testId`, `respondentId`);
