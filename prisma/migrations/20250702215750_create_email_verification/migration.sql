-- AlterTable
ALTER TABLE `tbalugueis` ALTER COLUMN `bdDTINICIO` DROP DEFAULT;

-- CreateTable
CREATE TABLE `tbEmailVerificado` (
    `bdChave` VARCHAR(191) NOT NULL,
    `bdEmail` VARCHAR(191) NOT NULL,
    `bdCode` VARCHAR(191) NOT NULL,
    `bdExpiresAt` DATETIME(3) NOT NULL,
    `bdVerified` BOOLEAN NOT NULL DEFAULT false,
    `bdCreatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`bdChave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
