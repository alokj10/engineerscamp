/*
  Warnings:

  - Added the required column `isCorrect` to the `QuestionAnswers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `QuestionAnswers` ADD COLUMN `isCorrect` BOOLEAN NOT NULL;
