-- ==============================================================================
-- Seed: 001_initial_users_and_properties.sql
-- Description: Seed data for development/demo environment ONLY.
--
-- SECURITY NOTICE:
-- The credentials below are DEVELOPMENT/DEMO credentials only.
-- Real passwords are NOT stored in plaintext. They are pre-hashed with bcrypt (cost 10).
-- NEVER run or use these demo credentials in production!
--
-- Demo Accounts:
-- 1. Super Admin: admin@community.local / Admin@12345
-- 2. Resident Tenant: preetham@community.local / Tenant1@12345
-- ==============================================================================

-- 1. Seed Roles
INSERT INTO `roles` (`id`, `code`, `name`, `description`) VALUES
  (1, 'SUPER_ADMIN', 'Super Administrator', 'Full platform operational, financial, and access authority'),
  (2, 'COMMITTEE_MEMBER', 'Management Committee', 'Society governance, approvals, and committee oversight'),
  (3, 'RESIDENT_OWNER', 'Flat Owner (Resident)', 'Owner residing in property with voting and unit rights'),
  (4, 'RESIDENT_TENANT', 'Resident Tenant', 'Tenant with household, amenity, and visitor privileges'),
  (5, 'SECURITY_GUARD', 'Gate Security Staff', 'Visitor log management and gate entry/exit tracking'),
  (6, 'MAINTENANCE_STAFF', 'Maintenance Personnel', 'Field technician for servicing maintenance tickets'),
  (7, 'SERVICE_VENDOR', 'External Vendor', 'Third-party vendor servicing scheduled society jobs')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- 2. Seed Demo Property
INSERT INTO `properties` (`id`, `code`, `name`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `total_blocks`, `total_units`) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'GREENFIELD', 'Greenfield Heights', '100 Outer Ring Road', 'Near Tech Park', 'Bengaluru', 'Karnataka', '560103', 4, 120)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Seed Demo Units
INSERT INTO `units` (`id`, `property_id`, `unit_number`, `block`, `floor`, `square_feet`, `unit_type`, `status`) VALUES
  ('u1111111-2222-3333-4444-555555555551', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '402', 'Tower A', 4, 1450, '3BHK', 'OCCUPIED'),
  ('u1111111-2222-3333-4444-555555555552', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '101', 'Tower A', 1, 1100, '2BHK', 'OCCUPIED'),
  ('u1111111-2222-3333-4444-555555555553', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '205', 'Tower B', 2, 1850, '4BHK', 'OCCUPIED'),
  ('u1111111-2222-3333-4444-555555555554', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '304', 'Tower B', 3, 1400, '3BHK', 'OCCUPIED'),
  ('u1111111-2222-3333-4444-555555555555', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '501', 'Tower C', 5, 2200, 'PENTHOUSE', 'UNDER_MAINTENANCE')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `unit_number` = VALUES(`unit_number`);

-- 4. Seed Demo Users (Development Accounts with bcrypt password hashes)
-- Demo Admin: admin@community.local / Admin@12345
-- Demo Tenant 1: preetham@community.local / Tenant1@12345
-- Demo Owner: vikramaditya@community.local / Owner@12345
-- Demo Tenant 2: ananya.sharma@community.local / Tenant2@12345
-- Demo Tenant 3: rahul.verma@community.local / Tenant3@12345
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone_number`, `role_id`, `is_active`) VALUES
  ('user-super-admin-000000000001', 'admin@community.local', '$2b$10$IZkfYeJR8vAgs6zoGnuG7O8warVx46mGVn6NlWoS2tdGCrcHS3cR6', 'Platform Super Admin', '+91 98765 43210', 1, TRUE),
  ('user-resident-tenant-00000002', 'preetham@community.local', '$2b$10$sguHc80I8Hhccz/Go0l6fuZU65qaZyRuXrfKJQMhibCuLk5b4Y9Z2', 'Preetham (Resident Tenant)', '+91 91234 56789', 4, TRUE),
  ('user-resident-owner-000000000003', 'vikramaditya@community.local', '$2b$10$48zk05HzR3xQB1sZk4vDtu562zcTm02soWULGva6Cy0Li8y/LITxW', 'Vikramaditya (Resident Owner)', '+91 98888 77777', 3, TRUE),
  ('user-resident-tenant-00000004', 'ananya.sharma@community.local', '$2b$10$N.Pe9osfp5l3omeeSmrnlujfcKyY7e4EhOSA13pjXHLBLRgksbTBq', 'Ananya Sharma (Resident Tenant)', '+91 98222 33445', 4, TRUE),
  ('user-resident-tenant-00000005', 'rahul.verma@community.local', '$2b$10$7wthTd2WhKlVZEcHINvVaeKfYbXR8ZDooy8pcZG3XaJY62RfzybPq', 'Rahul Verma (Resident Tenant)', '+91 97333 44556', 4, TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`), `is_active` = VALUES(`is_active`);

-- 5. Seed Demo User-Unit Assignment
INSERT INTO `user_unit_assignments` (`id`, `user_id`, `unit_id`, `assignment_type`, `is_primary`, `valid_from`, `status`) VALUES
  ('assign-00000000-0000-0000-0000-000000000001', 'user-resident-tenant-00000002', 'u1111111-2222-3333-4444-555555555551', 'TENANT', TRUE, '2026-01-01', 'ACTIVE'),
  ('assign-00000000-0000-0000-0000-000000000003', 'user-resident-owner-000000000003', 'u1111111-2222-3333-4444-555555555553', 'OWNER', TRUE, '2026-01-01', 'ACTIVE'),
  ('assign-00000000-0000-0000-0000-000000000004', 'user-resident-tenant-00000004', 'u1111111-2222-3333-4444-555555555552', 'TENANT', TRUE, '2026-01-01', 'ACTIVE'),
  ('assign-00000000-0000-0000-0000-000000000005', 'user-resident-tenant-00000005', 'u1111111-2222-3333-4444-555555555554', 'TENANT', TRUE, '2026-01-01', 'ACTIVE')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`), `unit_id` = VALUES(`unit_id`);
