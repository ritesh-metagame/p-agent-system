-- CreateTable
CREATE TABLE `NetworkStatistics` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `approved_count` INTEGER NOT NULL DEFAULT 0,
    `pending_count` INTEGER NOT NULL DEFAULT 0,
    `declined_count` INTEGER NOT NULL DEFAULT 0,
    `suspended_count` INTEGER NOT NULL DEFAULT 0,
    `total_count` INTEGER NOT NULL DEFAULT 0,
    `calculation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NetworkStatistics_site_id_idx`(`site_id`),
    INDEX `NetworkStatistics_role_id_idx`(`role_id`),
    UNIQUE INDEX `NetworkStatistics_role_id_site_id_calculation_date_key`(`role_id`, `site_id`, `calculation_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NetworkStatistics` ADD CONSTRAINT `NetworkStatistics_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NetworkStatistics` ADD CONSTRAINT `NetworkStatistics_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
