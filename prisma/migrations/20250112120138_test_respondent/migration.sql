/*
  Warnings:

  - Added the required column `code` to the `TestAccessCodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TestAccessCodes` ADD COLUMN `code` VARCHAR(255) NOT NULL;
