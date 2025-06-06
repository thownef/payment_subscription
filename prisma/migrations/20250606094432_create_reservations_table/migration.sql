-- CreateTable
CREATE TABLE `reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `email_setting_id` INTEGER NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `scheduled_at` DATETIME(3) NULL,
    `delivery_type` VARCHAR(191) NOT NULL DEFAULT 'immediate' COMMENT 'immediate, scheduled',
    `delivery_status` VARCHAR(191) NOT NULL DEFAULT 'pending' COMMENT 'pending, completed, failed',
    `is_click_measure` BOOLEAN NOT NULL DEFAULT false,
    `is_sent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
