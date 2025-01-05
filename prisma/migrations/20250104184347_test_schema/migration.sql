/*
  Warnings:

  - You are about to drop the column `userId` on the `AnswerOptions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Questions` table. All the data in the column will be lost.
  - You are about to drop the `QuestionAnswers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createUserId` to the `AnswerOptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createUserId` to the `Questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `AnswerOptions` DROP FOREIGN KEY `AnswerOptions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionAnswers` DROP FOREIGN KEY `QuestionAnswers_answerOptionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionAnswers` DROP FOREIGN KEY `QuestionAnswers_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `Questions` DROP FOREIGN KEY `Questions_userId_fkey`;

-- DropIndex
DROP INDEX `AnswerOptions_userId_fkey` ON `AnswerOptions`;

-- DropIndex
DROP INDEX `Questions_userId_fkey` ON `Questions`;

-- AlterTable
ALTER TABLE `AnswerOptions` DROP COLUMN `userId`,
    ADD COLUMN `createUserId` INTEGER NOT NULL,
    ALTER COLUMN `createdOn` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Questions` DROP COLUMN `userId`,
    ADD COLUMN `createUserId` INTEGER NOT NULL,
    ALTER COLUMN `createdOn` DROP DEFAULT;

-- DropTable
DROP TABLE `QuestionAnswers`;

-- CreateTable
CREATE TABLE `QuestionAnswerMappings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `answerOptionId` INTEGER NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `questionSortOrder` VARCHAR(191) NOT NULL,
    `createUserId` INTEGER NOT NULL,
    `createdOn` DATETIME(3) NOT NULL,
    `updatedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestQuestionMappings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Questions` ADD CONSTRAINT `Questions_createUserId_fkey` FOREIGN KEY (`createUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerOptions` ADD CONSTRAINT `AnswerOptions_createUserId_fkey` FOREIGN KEY (`createUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionAnswerMappings` ADD CONSTRAINT `QuestionAnswerMappings_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionAnswerMappings` ADD CONSTRAINT `QuestionAnswerMappings_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tests` ADD CONSTRAINT `Tests_createUserId_fkey` FOREIGN KEY (`createUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionMappings` ADD CONSTRAINT `TestQuestionMappings_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestQuestionMappings` ADD CONSTRAINT `TestQuestionMappings_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
