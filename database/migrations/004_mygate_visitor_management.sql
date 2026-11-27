-- ==============================================================================
-- Migration: 004_mygate_visitor_management.sql
-- Description: Additive extension for My Gate (Resident Visitor Entry Management)
--              and Security Guard module foundation (MySQL 8.0+)
-- ==============================================================================

-- 1. Extend Visitors table with My Gate and Security fields
ALTER TABLE `visitors`
  ADD COLUMN IF NOT EXISTS `entry_type` ENUM('PRE_APPROVED', 'WALK_IN') NOT NULL DEFAULT 'PRE_APPROVED',
  ADD COLUMN IF NOT EXISTS `visitor_type` ENUM('GUEST', 'DELIVERY', 'CAB', 'SERVICE', 'OTHER') NOT NULL DEFAULT 'GUEST',
  ADD COLUMN IF NOT EXISTS `vehicle_number` VARCHAR(30) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `rejection_reason` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `approved_by_user_id` CHAR(36) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `approved_at` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `valid_until` TIMESTAMP NULL DEFAULT NULL,
  MODIFY COLUMN `status` ENUM(
    'PENDING',
    'APPROVED',
    'PRE_APPROVED',
    'AT_GATE',
    'CHECKED_IN',
    'CHECKED_OUT',
    'REJECTED',
    'EXPIRED',
    'CANCELLED'
  ) NOT NULL DEFAULT 'PENDING';

-- Add performance indexes for visitor filtering
ALTER TABLE `visitors`
  ADD INDEX IF NOT EXISTS `idx_visitors_entry_type` (`entry_type`),
  ADD INDEX IF NOT EXISTS `idx_visitors_type` (`visitor_type`);

-- 2. Security Guards Assignment Table
CREATE TABLE IF NOT EXISTS `security_guards` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL,
  `property_id` CHAR(36) NOT NULL,
  `gate_name` VARCHAR(100) NOT NULL DEFAULT 'Main Gate 1',
  `shift` ENUM('MORNING', 'EVENING', 'NIGHT', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
  `badge_number` VARCHAR(50) DEFAULT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_guards_user` (`user_id`),
  INDEX `idx_guards_property` (`property_id`),
  INDEX `idx_guards_active` (`is_active`),
  CONSTRAINT `fk_guards_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_guards_property` FOREIGN KEY (`property_id`)
    REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
