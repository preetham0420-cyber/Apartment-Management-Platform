-- ==============================================================================
-- Migration: 002_core_features.sql
-- Description: Core Functional Feature Tables for Apartment Management Platform
-- Engines: InnoDB, Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Community Notices Table
CREATE TABLE IF NOT EXISTS `notices` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `property_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'GENERAL',
  `priority` ENUM('LOW', 'NORMAL', 'URGENT') DEFAULT 'NORMAL',
  `author_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_notices_property` (`property_id`),
  INDEX `idx_notices_priority` (`priority`),
  CONSTRAINT `fk_notices_property` FOREIGN KEY (`property_id`) 
    REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notices_author` FOREIGN KEY (`author_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Visitors Table
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `unit_id` CHAR(36) NOT NULL,
  `host_user_id` CHAR(36) NOT NULL,
  `visitor_name` VARCHAR(150) NOT NULL,
  `visitor_phone` VARCHAR(20) NOT NULL,
  `purpose` VARCHAR(100) NOT NULL DEFAULT 'GUEST',
  `expected_arrival` TIMESTAMP NOT NULL,
  `status` ENUM('PRE_APPROVED', 'AT_GATE', 'CHECKED_IN', 'CHECKED_OUT', 'REJECTED') DEFAULT 'PRE_APPROVED',
  `access_code` VARCHAR(10) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_visitors_unit` (`unit_id`),
  INDEX `idx_visitors_host` (`host_user_id`),
  INDEX `idx_visitors_status` (`status`),
  CONSTRAINT `fk_visitors_unit` FOREIGN KEY (`unit_id`) 
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_visitors_host` FOREIGN KEY (`host_user_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Visitor Events / Gate Log Table
CREATE TABLE IF NOT EXISTS `visitor_events` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `visitor_id` CHAR(36) NOT NULL,
  `event_type` ENUM('ENTRY', 'EXIT', 'OVERSTAY_ALERT') NOT NULL,
  `gate_number` VARCHAR(50) DEFAULT 'Main Gate 1',
  `recorded_by_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_events_visitor` (`visitor_id`),
  CONSTRAINT `fk_events_visitor` FOREIGN KEY (`visitor_id`) 
    REFERENCES `visitors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS `maintenance_requests` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `unit_id` CHAR(36) NOT NULL,
  `resident_id` CHAR(36) NOT NULL,
  `category` ENUM('PLUMBING', 'ELECTRICAL', 'CARPENTRY', 'APPLIANCE', 'COMMON_AREA', 'OTHER') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY') DEFAULT 'MEDIUM',
  `status` ENUM('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED') DEFAULT 'REPORTED',
  `assigned_to_user_id` CHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_maintenance_unit` (`unit_id`),
  INDEX `idx_maintenance_resident` (`resident_id`),
  INDEX `idx_maintenance_status` (`status`),
  CONSTRAINT `fk_maintenance_unit` FOREIGN KEY (`unit_id`) 
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_maintenance_resident` FOREIGN KEY (`resident_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Maintenance Comments Table
CREATE TABLE IF NOT EXISTS `maintenance_comments` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `request_id` CHAR(36) NOT NULL,
  `author_id` CHAR(36) NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_request` (`request_id`),
  CONSTRAINT `fk_comments_request` FOREIGN KEY (`request_id`) 
    REFERENCES `maintenance_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_author` FOREIGN KEY (`author_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Dues & Invoices Table
CREATE TABLE IF NOT EXISTS `dues` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `unit_id` CHAR(36) NOT NULL,
  `resident_id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('PENDING', 'PAID', 'OVERDUE') DEFAULT 'PENDING',
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `payment_reference` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dues_unit` (`unit_id`),
  INDEX `idx_dues_resident` (`resident_id`),
  INDEX `idx_dues_status` (`status`),
  CONSTRAINT `fk_dues_unit` FOREIGN KEY (`unit_id`) 
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_dues_resident` FOREIGN KEY (`resident_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Amenities Table
CREATE TABLE IF NOT EXISTS `amenities` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `property_id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `capacity` INT UNSIGNED DEFAULT 10,
  `rules` TEXT DEFAULT NULL,
  `open_time` TIME DEFAULT '06:00:00',
  `close_time` TIME DEFAULT '22:00:00',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_amenities_property` (`property_id`),
  CONSTRAINT `fk_amenities_property` FOREIGN KEY (`property_id`) 
    REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Amenity Bookings Table
CREATE TABLE IF NOT EXISTS `amenity_bookings` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `amenity_id` CHAR(36) NOT NULL,
  `resident_id` CHAR(36) NOT NULL,
  `unit_id` CHAR(36) NOT NULL,
  `start_time` TIMESTAMP NOT NULL,
  `end_time` TIMESTAMP NOT NULL,
  `status` ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_bookings_amenity` (`amenity_id`),
  INDEX `idx_bookings_resident` (`resident_id`),
  CONSTRAINT `fk_bookings_amenity` FOREIGN KEY (`amenity_id`) 
    REFERENCES `amenities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_resident` FOREIGN KEY (`resident_id`) 
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_unit` FOREIGN KEY (`unit_id`) 
    REFERENCES `units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `actor_id` CHAR(36) DEFAULT NULL,
  `actor_email` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource_type` VARCHAR(100) NOT NULL,
  `resource_id` VARCHAR(100) DEFAULT NULL,
  `details` JSON DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_resource` (`resource_type`, `resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
