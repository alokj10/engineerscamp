-- AlterTable
ALTER TABLE `Tests` ADD COLUMN `manualActivationPeriod` VARCHAR(191) NULL,
    ADD COLUMN `scheduledActivationEndsOn` DATETIME(3) NULL,
    ADD COLUMN `scheduledActivationStartsOn` DATETIME(3) NULL,
    ADD COLUMN `testActivationMethod` VARCHAR(191) NULL,
    ADD COLUMN `testDurationForQuestion` VARCHAR(191) NULL,
    ADD COLUMN `testDurationForTest` VARCHAR(191) NULL,
    ADD COLUMN `testDurationMethod` VARCHAR(191) NULL;
