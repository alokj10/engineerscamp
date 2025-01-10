-- AlterTable
ALTER TABLE `Tests` ADD COLUMN `testAccessMode` VARCHAR(191) NOT NULL DEFAULT 'AccessCode';

-- CreateTable
CREATE TABLE `TestAccessCodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `respondentId` INTEGER NOT NULL,
    `updatedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Respondent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `timeZone` VARCHAR(191) NULL,
    `updatedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestResponse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testId` INTEGER NOT NULL,
    `respondentId` INTEGER NOT NULL,
    `startedOn` DATETIME(3) NOT NULL,
    `submittedOn` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `score` INTEGER NOT NULL,
    `updatedOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestResponseDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `testResponseId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `answerOptionId` INTEGER NOT NULL,
    `answeredOn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestAccessCodes` ADD CONSTRAINT `TestAccessCodes_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestAccessCodes` ADD CONSTRAINT `TestAccessCodes_respondentId_fkey` FOREIGN KEY (`respondentId`) REFERENCES `Respondent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResponse` ADD CONSTRAINT `TestResponse_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResponse` ADD CONSTRAINT `TestResponse_respondentId_fkey` FOREIGN KEY (`respondentId`) REFERENCES `Respondent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResponseDetails` ADD CONSTRAINT `TestResponseDetails_testResponseId_fkey` FOREIGN KEY (`testResponseId`) REFERENCES `TestResponse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResponseDetails` ADD CONSTRAINT `TestResponseDetails_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResponseDetails` ADD CONSTRAINT `TestResponseDetails_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
