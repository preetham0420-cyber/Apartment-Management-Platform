-- ==============================================================================
-- Migration: 001_roles_users_properties_units.sql
-- Description: Core schema for Apartment Management Platform (MySQL 8.0+)
-- Engines: InnoDB, Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Properties Table
CREATE TABLE IF NOT EXISTS `properties` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `postal_code` VARCHAR(20) NOT NULL,
  `total_blocks` INT UNSIGNED DEFAULT 1,
  `total_units` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_properties_code` (`code`),
  INDEX `idx_properties_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Units Table
CREATE TABLE IF NOT EXISTS `units` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `property_id` CHAR(36) NOT NULL,
  `unit_number` VARCHAR(20) NOT NULL,
  `block` VARCHAR(20) NOT NULL,
  `floor` INT NOT NULL DEFAULT 1,
  `square_feet` INT UNSIGNED DEFAULT NULL,
  `unit_type` ENUM('1BHK', '2BHK', '3BHK', '4BHK', 'PENTHOUSE', 'COMMERCIAL') NOT NULL DEFAULT '2BHK',
  `status` ENUM('OCCUPIED', 'VACANT', 'UNDER_MAINTENANCE') NOT NULL DEFAULT 'VACANT',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_property_unit` (`property_id`, `unit_number`),
  INDEX `idx_units_property` (`property_id`),
  INDEX `idx_units_status` (`status`),
  CONSTRAINT `fk_units_property` FOREIGN KEY (`property_id`) 
    REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Users Table (No plaintext passwords; secure bcrypt password_hash only)
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login_at` TIMESTAMP DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_active` (`is_active`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) 
    REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. User-Unit Assignments Table
CREATE TABLE IF NOT EXISTS `user_unit_assignments` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL,
  `unit_id` CHAR(36) NOT NULL,
  `assignment_type` ENUM('OWNER', 'TENANT', 'HOUSEHOLD_MEMBER') NOT NULL DEFAULT 'TENANT',
  `is_primary` BOOLEAN NOT NULL DEFAULT TRUE,
  `valid_from` DATE NOT NULL,
  `valid_until` DATE DEFAULT NULL,
  `status` ENUM('ACTIVE', 'PENDING_APPROVAL', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_unit` (`user_id`, `unit_id`),
  INDEX `idx_assignments_user` (`user_id`),
  INDEX `idx_assignments_unit` (`unit_id`),
  INDEX `idx_assignments_status` (`status`),
  CONSTRAINT `fk_assignments_user` FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignments_unit` FOREIGN KEY (`unit_id`) 
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
