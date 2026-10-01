-- ==============================================================================
-- Seed: 002_core_features.sql
-- Description: Deterministic initial data for core features
-- ==============================================================================

-- 1. Seed Notices
INSERT INTO `notices` (`id`, `property_id`, `title`, `content`, `category`, `priority`, `author_id`) VALUES
  ('notice-00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Scheduled Power Backup Drill', 'Scheduled power backup drill this Saturday between 10:00 AM - 12:00 PM across all blocks.', 'MAINTENANCE', 'NORMAL', 'user-super-admin-000000000001'),
  ('notice-00000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Clubhouse Deep Cleaning Notice', 'Clubhouse and indoor games arena will be closed on Monday for monthly sanitization.', 'AMENITY', 'LOW', 'user-super-admin-000000000001')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 2. Seed Amenities
INSERT INTO `amenities` (`id`, `property_id`, `name`, `description`, `capacity`, `rules`, `open_time`, `close_time`, `is_active`) VALUES
  ('amenity-00000000-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Clubhouse Banquet Hall', 'Spacious hall for family gatherings, birthdays and community functions.', 80, 'Prior booking required. Sound limit 65dB after 10 PM.', '09:00:00', '22:00:00', TRUE),
  ('amenity-00000000-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Badminton Court A', 'Indoor synthetic court with professional LED lighting.', 4, 'Non-marking shoes mandatory.', '06:00:00', '21:00:00', TRUE),
  ('amenity-00000000-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Swimming Pool & Deck', 'Half-Olympic size pool with separate kids splash pool.', 25, 'Swimwear mandatory. Shower before entry.', '06:30:00', '20:30:00', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Seed Visitors
INSERT INTO `visitors` (`id`, `unit_id`, `host_user_id`, `visitor_name`, `visitor_phone`, `purpose`, `expected_arrival`, `status`, `access_code`) VALUES
  ('vis-00000000-0000-0000-0000-000000000001', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'Amazon Delivery Agent', '+91 99887 76655', 'DELIVERY', NOW() + INTERVAL 2 HOUR, 'PRE_APPROVED', 'GATE-4021'),
  ('vis-00000000-0000-0000-0000-000000000002', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'Rahul Sharma (Guest)', '+91 98888 12345', 'GUEST', NOW() + INTERVAL 4 HOUR, 'AT_GATE', 'GATE-4022')
ON DUPLICATE KEY UPDATE `visitor_name` = VALUES(`visitor_name`);

-- 4. Seed Maintenance Requests
INSERT INTO `maintenance_requests` (`id`, `unit_id`, `resident_id`, `category`, `title`, `description`, `priority`, `status`) VALUES
  ('maint-00000000-0000-0000-0000-000000000001', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'PLUMBING', 'Kitchen Sink Water Leakage', 'Water is dripping slowly from the pipe under the main kitchen sink.', 'MEDIUM', 'ASSIGNED')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 5. Seed Dues
INSERT INTO `dues` (`id`, `unit_id`, `resident_id`, `title`, `amount`, `due_date`, `status`) VALUES
  ('due-00000000-0000-0000-0000-000000000001', 'u1111111-2222-3333-4444-555555555551', 'user-resident-tenant-00000002', 'September Maintenance & Water Charges', 4850.00, CURDATE() + INTERVAL 10 DAY, 'PENDING')
ON DUPLICATE KEY UPDATE `amount` = VALUES(`amount`);
