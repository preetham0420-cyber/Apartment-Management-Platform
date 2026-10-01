-- ==============================================================================
-- Migration: 003_extended_features.sql
-- Description: Extended Tables for Household, Vehicles, Parking, Documents,
--              Attachments, and Targeted Notifications (MySQL 8.0+)
-- ==============================================================================

-- 1. Property Settings & Society Contact Enhancements
ALTER TABLE `properties`
  ADD COLUMN IF NOT EXISTS `contact_email` VARCHAR(255) DEFAULT 'office@community.local',
  ADD COLUMN IF NOT EXISTS `contact_phone` VARCHAR(30) DEFAULT '+91 80 2345 6789',
  ADD COLUMN IF NOT EXISTS `emergency_phone` VARCHAR(30) DEFAULT '+91 80 9999 0000',
  ADD COLUMN IF NOT EXISTS `rules_summary` TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `payment_instructions` TEXT DEFAULT 'Bank NEFT / UPI to Greenfield RWA A/C 9876543210 IFSC: HDFC0001234';

-- 2. Assignment Rejection Reason for Onboarding
ALTER TABLE `user_unit_assignments`
  ADD COLUMN IF NOT EXISTS `rejection_reason` VARCHAR(255) DEFAULT NULL;

-- 3. Household Members Table
CREATE TABLE IF NOT EXISTS `household_members` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `unit_id` CHAR(36) NOT NULL,
  `resident_user_id` CHAR(36) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `relationship` VARCHAR(50) NOT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `is_emergency_contact` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_household_unit` (`unit_id`),
  INDEX `idx_household_resident` (`resident_user_id`),
  CONSTRAINT `fk_household_unit` FOREIGN KEY (`unit_id`)
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_household_resident` FOREIGN KEY (`resident_user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Parking Slots Table
CREATE TABLE IF NOT EXISTS `parking_slots` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `property_id` CHAR(36) NOT NULL,
  `slot_number` VARCHAR(30) NOT NULL,
  `level_location` VARCHAR(50) NOT NULL DEFAULT 'Basement B1',
  `unit_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parking_property` (`property_id`),
  INDEX `idx_parking_unit` (`unit_id`),
  CONSTRAINT `fk_parking_property` FOREIGN KEY (`property_id`)
    REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_parking_unit` FOREIGN KEY (`unit_id`)
    REFERENCES `units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Vehicles Table
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `unit_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `vehicle_number` VARCHAR(30) NOT NULL,
  `vehicle_type` ENUM('TWO_WHEELER', 'FOUR_WHEELER', 'EV') NOT NULL DEFAULT 'FOUR_WHEELER',
  `make_model` VARCHAR(100) DEFAULT NULL,
  `parking_slot_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_vehicles_unit` (`unit_id`),
  INDEX `idx_vehicles_user` (`user_id`),
  INDEX `idx_vehicles_slot` (`parking_slot_id`),
  CONSTRAINT `fk_vehicles_unit` FOREIGN KEY (`unit_id`)
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vehicles_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vehicles_slot` FOREIGN KEY (`parking_slot_id`)
    REFERENCES `parking_slots` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Documents Table
CREATE TABLE IF NOT EXISTS `documents` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `property_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` ENUM('APARTMENT_BYLAWS', 'FIRE_SAFETY', 'LIFT_AMC', 'AGM_MINUTES', 'FINANCIAL', 'OTHER') NOT NULL DEFAULT 'OTHER',
  `file_url` TEXT NOT NULL,
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  `uploaded_by_user_id` CHAR(36) NOT NULL,
  `access_level` ENUM('ALL_RESIDENTS', 'OWNERS_ONLY', 'ADMIN_ONLY') DEFAULT 'ALL_RESIDENTS',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_documents_property` (`property_id`),
  INDEX `idx_documents_category` (`category`),
  INDEX `idx_documents_access` (`access_level`),
  CONSTRAINT `fk_documents_property` FOREIGN KEY (`property_id`)
    REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_documents_uploader` FOREIGN KEY (`uploaded_by_user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Maintenance Attachments Table
CREATE TABLE IF NOT EXISTS `maintenance_attachments` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `request_id` CHAR(36) NOT NULL,
  `file_url` TEXT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_attachments_request` (`request_id`),
  CONSTRAINT `fk_attachments_request` FOREIGN KEY (`request_id`)
    REFERENCES `maintenance_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. User In-App Notifications Table
CREATE TABLE IF NOT EXISTS `user_notifications` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `user_id` CHAR(36) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `body` TEXT NOT NULL,
  `type` ENUM('VISITOR', 'MAINTENANCE', 'PAYMENT', 'NOTICE', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  `reference_id` VARCHAR(64) DEFAULT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_unread` (`user_id`, `is_read`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
