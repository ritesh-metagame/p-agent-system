-- CreateTable
CREATE TABLE `TopPerformerSummary` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `settled_transactions` INTEGER NOT NULL DEFAULT 0,
    `operator_name` VARCHAR(191) NULL,
    `pending_commission` DOUBLE NULL,
    `released_all_time` DOUBLE NULL,
    `calculation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TopPerformerSummary_site_id_idx`(`site_id`),
    INDEX `TopPerformerSummary_user_id_idx`(`user_id`),
    INDEX `TopPerformerSummary_role_id_idx`(`role_id`),
    UNIQUE INDEX `TopPerformerSummary_user_id_site_id_calculation_date_key`(`user_id`, `site_id`, `calculation_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TopPerformerSummary` ADD CONSTRAINT `TopPerformerSummary_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformerSummary` ADD CONSTRAINT `TopPerformerSummary_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformerSummary` ADD CONSTRAINT `TopPerformerSummary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
