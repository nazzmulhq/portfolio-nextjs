-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `users_id_key`(`id`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `name_email_index`(`name`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Role_id_key`(`id`),
    UNIQUE INDEX `Role_slug_key`(`slug`),
    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Permission_id_key`(`id`),
    UNIQUE INDEX `Permission_slug_key`(`slug`),
    UNIQUE INDEX `Permission_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('guest', 'shared', 'protected', 'devOnly') NOT NULL DEFAULT 'guest',
    `parentId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `isComponent` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Route_id_key`(`id`),
    UNIQUE INDEX `Route_slug_key`(`slug`),
    UNIQUE INDEX `Route_name_key`(`name`),
    UNIQUE INDEX `Route_path_key`(`path`),
    INDEX `name_path_index`(`name`, `path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,

    INDEX `user_id_index`(`userId`),
    INDEX `role_id_index`(`roleId`),
    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` VARCHAR(191) NOT NULL,
    `permissionId` VARCHAR(191) NOT NULL,

    INDEX `role_id_index`(`roleId`),
    INDEX `permission_id_index`(`permissionId`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission_routes` (
    `permissionId` VARCHAR(191) NOT NULL,
    `routeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `permission_id_index`(`permissionId`),
    INDEX `route_id_index`(`routeId`),
    PRIMARY KEY (`permissionId`, `routeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermissionToRoute` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PermissionToRoute_AB_unique`(`A`, `B`),
    INDEX `_PermissionToRoute_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermissionToRole` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PermissionToRole_AB_unique`(`A`, `B`),
    INDEX `_PermissionToRole_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Route` ADD CONSTRAINT `Route_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Route`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permission_routes` ADD CONSTRAINT `permission_routes_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permission_routes` ADD CONSTRAINT `permission_routes_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRoute` ADD CONSTRAINT `_PermissionToRoute_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRoute` ADD CONSTRAINT `_PermissionToRoute_B_fkey` FOREIGN KEY (`B`) REFERENCES `Route`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRole` ADD CONSTRAINT `_PermissionToRole_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermissionToRole` ADD CONSTRAINT `_PermissionToRole_B_fkey` FOREIGN KEY (`B`) REFERENCES `Role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
