/*
  Warnings:

  - You are about to drop the column `questionId` on the `TestQuestionMappings` table. All the data in the column will be lost.
  - Added the required column `questionAnswerMappingId` to the `TestQuestionMappings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Tests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `TestQuestionMappings` DROP FOREIGN KEY `TestQuestionMappings_questionId_fkey`;

-- DropIndex
DROP INDEX `TestQuestionMappings_questionId_fkey` ON `TestQuestionMappings`;

-- AlterTable
ALTER TABLE `TestQuestionMappings` DROP COLUMN `questionId`,
    ADD COLUMN `questionAnswerMappingId` INTEGER NOT NULL,
    ADD COLUMN `questionsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Tests` ADD COLUMN `status` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TestQuestionMappings` ADD CONSTRAINT `TestQuestionMappings_questionAnswerMappingId_fkey` FOREIGN KEY (`questionAnswerMappingId`) REFERENCES `QuestionAnswerMappings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionMappings` ADD CONSTRAINT `TestQuestionMappings_questionsId_fkey` FOREIGN KEY (`questionsId`) REFERENCES `Questions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
