-- AlterTable
ALTER TABLE `uploads` ADD COLUMN `folder` VARCHAR(191) NULL DEFAULT 'uploads',
    ADD COLUMN `public_id` VARCHAR(191) NULL;
