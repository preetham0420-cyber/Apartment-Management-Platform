-- ==============================================================================
-- Seed: 003_extended_features.sql
-- Description: Deterministic Demo Seeds for Owner, Household, Vehicles,
--              Parking, Documents, and Notifications
-- ==============================================================================

-- 1. Update Demo Property Settings
UPDATE `properties`
SET
  `contact_email` = 'office@greenfield.local',
  `contact_phone` = '+91 80 2841 5500',
  `emergency_phone` = '+91 80 9999 1122',
  `rules_summary` = '1. Quiet hours observed 10:00 PM to 06:00 AM.\n2. Visitor vehicles permitted only in designated guest bays.\n3. Clubhouse booking requires 24h advance reservation.\n4. Waste segregation (Dry, Wet, Sanitary) is mandatory.',
  `payment_instructions` = 'Transfer maintenance dues via NEFT/UPI to Greenfield Association: HDFC A/C 50200012345678, IFSC: HDFC0001234 or UPI ID: greenfieldrwa@hdfcbank'
WHERE `id` = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

-- 2. Seed Demo Resident Owner Account: vikramaditya@community.local / Owner@12345
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone_number`, `role_id`, `is_active`) VALUES
  ('user-resident-owner-000000000003', 'vikramaditya@community.local', '$2b$10$48zk05HzR3xQB1sZk4vDtu562zcTm02soWULGva6Cy0Li8y/LITxW', 'Vikramaditya (Resident Owner)', '+91 98888 77777', 3, TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `email` = VALUES(`email`);

-- Assign Owner to Unit 205 (u1111111-2222-3333-4444-555555555553)
INSERT INTO `user_unit_assignments` (`id`, `user_id`, `unit_id`, `assignment_type`, `is_primary`, `valid_from`, `status`) VALUES
  ('assign-00000000-0000-0000-0000-000000000003', 'user-resident-owner-000000000003', 'u1111111-2222-3333-4444-555555555553', 'OWNER', TRUE, '2025-01-01', 'ACTIVE')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 3. Seed Parking Slots
INSERT INTO `parking_slots` (`id`, `property_id`, `slot_number`, `level_location`, `unit_id`) VALUES
  ('slot-00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'P-B1-042', 'Basement B1 (Tower A)', 'u1111111-2222-3333-4444-555555555551'),
  ('slot-00000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'P-B1-043', 'Basement B1 (Tower A)', 'u1111111-2222-3333-4444-555555555551'),
  ('slot-00000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'P-B2-110', 'Basement B2 (Tower B)', 'u1111111-2222-3333-4444-555555555553'),
  ('slot-00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'P-VISITOR-G1', 'Ground Level Gate 1', NULL)
ON DUPLICATE KEY UPDATE `slot_number` = VALUES(`slot_number`);

-- 4. Seed Vehicles
INSERT INTO `vehicles` (`id`, `unit_id`, `user_id`, `vehicle_number`, `vehicle_type`, `make_model`, `parking_slot_id`) VALUES
  ('veh-00000000-0000-0000-0000-000000000001', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'KA-01-MJ-4492', 'FOUR_WHEELER', 'Honda City (Pearl White)', 'slot-00000000-0000-0000-0000-000000000001'),
  ('veh-00000000-0000-0000-0000-000000000002', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'KA-01-EE-8821', 'EV', 'Ather 450X (Space Grey)', 'slot-00000000-0000-0000-0000-000000000002'),
  ('veh-00000000-0000-0000-0000-000000000003', 'u1111111-2222-3333-4444-555555555553', 'user-resident-owner-000000000003', 'KA-05-NB-1008', 'FOUR_WHEELER', 'Toyota Hycross (Silver)', 'slot-00000000-0000-0000-0000-000000000003')
ON DUPLICATE KEY UPDATE `vehicle_number` = VALUES(`vehicle_number`);

-- 5. Seed Household Members
INSERT INTO `household_members` (`id`, `unit_id`, `resident_user_id`, `full_name`, `relationship`, `phone_number`, `is_emergency_contact`) VALUES
  ('hh-00000000-0000-0000-0000-000000000001', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'Ananya Sharma', 'Spouse', '+91 91234 56788', TRUE),
  ('hh-00000000-0000-0000-0000-000000000002', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'Aarav Sharma', 'Son', '+91 91234 56787', FALSE),
  ('hh-00000000-0000-0000-0000-000000000003', 'u1111111-2222-3333-4444-555555555553', 'user-resident-owner-000000000003', 'Meera Rao', 'Spouse', '+91 98888 77776', TRUE)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

-- 6. Seed Documents
INSERT INTO `documents` (`id`, `property_id`, `title`, `description`, `category`, `file_url`, `file_size`, `mime_type`, `uploaded_by_user_id`, `access_level`) VALUES
  ('doc-00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Greenfield Heights Association Bylaws (2024 Amendment)', 'Official registered bylaws of the apartment owners association.', 'APARTMENT_BYLAWS', '/documents/greenfield_bylaws_2024.pdf', 1450200, 'application/pdf', 'user-super-admin-000000000001', 'ALL_RESIDENTS'),
  ('doc-00000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'State Fire Safety Compliance Certificate (NOC)', 'Annual fire department inspection and clearance certificate.', 'FIRE_SAFETY', '/documents/fire_noc_2026.pdf', 892000, 'application/pdf', 'user-super-admin-000000000001', 'ALL_RESIDENTS'),
  ('doc-00000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Schindler Lifts Annual Maintenance Contract (AMC)', 'Elevator maintenance SLA and monthly technician inspection roster.', 'LIFT_AMC', '/documents/schindler_amc_2026.pdf', 540000, 'application/pdf', 'user-super-admin-000000000001', 'ALL_RESIDENTS'),
  ('doc-00000000-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '18th Annual General Body Meeting (AGM) Minutes', 'Minutes of the AGM held on August 15th 2026 with audited accounts.', 'AGM_MINUTES', '/documents/agm_minutes_aug_2026.pdf', 2150000, 'application/pdf', 'user-super-admin-000000000001', 'OWNERS_ONLY'),
  ('doc-00000000-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Master Security Vendor Contract (Confidential)', 'Operational agreement with Apex Security Services.', 'OTHER', '/documents/security_vendor_contract.pdf', 3100000, 'application/pdf', 'user-super-admin-000000000001', 'ADMIN_ONLY')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 7. Seed In-App User Notifications
INSERT INTO `user_notifications` (`id`, `user_id`, `title`, `body`, `type`, `reference_id`, `is_read`) VALUES
  ('notif-00000000-0000-0000-0000-00000001', 'user-resident-tenant-00000002', 'Guest Checked In at Main Gate', 'Your visitor Ramesh Kumar has passed Gate 1 and is en route to Flat 402.', 'VISITOR', 'vis-00000000-0000-0000-0000-000000000001', FALSE),
  ('notif-00000000-0000-0000-0000-00000002', 'user-resident-tenant-00000002', 'Maintenance Request Assigned', 'Plumber Ravi Kumar has been assigned to your ticket #MNT-001 (Leaking pipe).', 'MAINTENANCE', 'req-00000000-0000-0000-0000-000000000001', TRUE),
  ('notif-00000000-0000-0000-0000-00000003', 'user-resident-tenant-00000002', 'Maintenance Dues Invoice Generated', 'Invoice for October 2026 maintenance dues (Rs. 4,500) has been generated.', 'PAYMENT', 'due-00000000-0000-0000-0000-000000000001', FALSE)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
