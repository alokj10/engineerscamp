-- AlterTable
ALTER TABLE `Tests` ADD COLUMN `completionMessage` TEXT NULL,
    ADD COLUMN `failMessage` TEXT NULL,
    ADD COLUMN `passMessage` TEXT NULL,
    ADD COLUMN `passingScore` INTEGER NULL DEFAULT 60,
    ADD COLUMN `passingScoreUnit` VARCHAR(191) NULL DEFAULT 'Percentage',
    ADD COLUMN `resultRecipients` TEXT NULL,
    ADD COLUMN `showCorrectAnswer` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `showPassFailMessage` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `showResults` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `showScore` BOOLEAN NULL DEFAULT false;
