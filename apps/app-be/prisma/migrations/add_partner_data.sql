-- Sample partner data
INSERT INTO "Partner" (id, name, description, address, city, state, country, "postalCode", phone, email, website, "imageUrl", rating, "totalReviews", "isActive", "operatingHours", specializations, "createdAt", "updatedAt")
VALUES 
  ('cltest001', 'GrabHealth Pharmacy - Downtown', 'Your trusted health partner in downtown district', '123 Main Street, Downtown District', 'Singapore', 'Singapore', 'Singapore', '123456', '+65 1234 5678', 'downtown@grabhealth.sg', 'https://grabhealth.sg', NULL, 4.5, 156, true, '{"monday":{"open":"09:00","close":"20:00"},"tuesday":{"open":"09:00","close":"20:00"},"wednesday":{"open":"09:00","close":"20:00"},"thursday":{"open":"09:00","close":"20:00"},"friday":{"open":"09:00","close":"20:00"},"saturday":{"open":"09:00","close":"20:00"},"sunday":{"open":"10:00","close":"18:00"}}', ARRAY['Pharmacy', 'Health Screening', 'Vaccination'], NOW(), NOW()),
  ('cltest002', 'Wellness Clinic - Midtown', 'Comprehensive healthcare services', '456 Health Avenue, Midtown', 'Singapore', 'Singapore', 'Singapore', '234567', '+65 2345 6789', 'midtown@wellnessclinic.sg', NULL, NULL, 4.2, 89, true, '{"monday":{"open":"08:00","close":"18:00"},"tuesday":{"open":"08:00","close":"18:00"},"wednesday":{"open":"08:00","close":"18:00"},"thursday":{"open":"08:00","close":"18:00"},"friday":{"open":"08:00","close":"18:00"},"saturday":{"open":"09:00","close":"15:00"},"sunday":{"open":"closed","close":"closed"}}', ARRAY['General Practice', 'Health Screening', 'Specialist Consultation'], NOW(), NOW()),
  ('cltest003', 'GrabHealth Center - Eastside', 'Premium health services and products', '789 Wellness Road, East District', 'Singapore', 'Singapore', 'Singapore', '345678', '+65 3456 7890', 'eastside@grabhealth.sg', NULL, NULL, 4.7, 234, true, '{"monday":{"open":"09:00","close":"19:00"},"tuesday":{"open":"09:00","close":"19:00"},"wednesday":{"open":"09:00","close":"19:00"},"thursday":{"open":"09:00","close":"19:00"},"friday":{"open":"09:00","close":"19:00"},"saturday":{"open":"09:00","close":"19:00"},"sunday":{"open":"closed","close":"closed"}}', ARRAY['Health Screening', 'Physiotherapy', 'Nutrition Counseling'], NOW(), NOW());

-- Sample services for partners
INSERT INTO "Service" (id, "partnerId", name, description, duration, price, category, "isActive", "requiresApproval", "maxBookingsPerDay", "createdAt", "updatedAt")
VALUES
  -- Services for Downtown Pharmacy
  ('clsvc001', 'cltest001', 'Basic Health Screening', 'Comprehensive health check including blood pressure, BMI, and basic blood tests', 60, 80.00, 'Body Check', true, false, 20, NOW(), NOW()),
  ('clsvc002', 'cltest001', 'Premium Health Screening', 'Advanced health screening with full blood panel and ECG', 90, 150.00, 'Body Check', true, false, 10, NOW(), NOW()),
  ('clsvc003', 'cltest001', 'Vaccination Consultation', 'Consultation and administration of vaccines', 30, 50.00, 'Consultation', true, false, 30, NOW(), NOW()),
  
  -- Services for Midtown Clinic
  ('clsvc004', 'cltest002', 'General Consultation', 'Consultation with general practitioner', 30, 60.00, 'Consultation', true, false, 40, NOW(), NOW()),
  ('clsvc005', 'cltest002', 'Executive Health Screening', 'Comprehensive executive health package', 120, 280.00, 'Body Check', true, true, 5, NOW(), NOW()),
  ('clsvc006', 'cltest002', 'Specialist Referral', 'Consultation and referral to specialists', 45, 120.00, 'Consultation', true, true, 15, NOW(), NOW()),
  
  -- Services for Eastside Center
  ('clsvc007', 'cltest003', 'Physiotherapy Session', 'One-on-one physiotherapy treatment', 60, 100.00, 'Therapy', true, false, 20, NOW(), NOW()),
  ('clsvc008', 'cltest003', 'Nutrition Counseling', 'Personalized nutrition and diet consultation', 45, 80.00, 'Consultation', true, false, 25, NOW(), NOW()),
  ('clsvc009', 'cltest003', 'Full Body Check', 'Comprehensive full body health screening', 90, 200.00, 'Body Check', true, false, 15, NOW(), NOW());

-- Sample partner availability (Monday to Saturday for all partners)
INSERT INTO "PartnerAvailability" (id, "partnerId", "dayOfWeek", "startTime", "endTime", "slotDuration", "maxBookingsPerSlot", "createdAt", "updatedAt")
VALUES
  -- Downtown Pharmacy (Mon-Sat 9AM-8PM, Sun 10AM-6PM)
  ('clavail001', 'cltest001', 1, '09:00', '20:00', 30, 2, NOW(), NOW()),
  ('clavail002', 'cltest001', 2, '09:00', '20:00', 30, 2, NOW(), NOW()),
  ('clavail003', 'cltest001', 3, '09:00', '20:00', 30, 2, NOW(), NOW()),
  ('clavail004', 'cltest001', 4, '09:00', '20:00', 30, 2, NOW(), NOW()),
  ('clavail005', 'cltest001', 5, '09:00', '20:00', 30, 2, NOW(), NOW()),
  ('clavail006', 'cltest001', 6, '09:00', '20:00', 30, 2, NOW(), NOW()),
  ('clavail007', 'cltest001', 0, '10:00', '18:00', 30, 2, NOW(), NOW()),
  
  -- Midtown Clinic (Mon-Fri 8AM-6PM, Sat 9AM-3PM)
  ('clavail008', 'cltest002', 1, '08:00', '18:00', 30, 1, NOW(), NOW()),
  ('clavail009', 'cltest002', 2, '08:00', '18:00', 30, 1, NOW(), NOW()),
  ('clavail010', 'cltest002', 3, '08:00', '18:00', 30, 1, NOW(), NOW()),
  ('clavail011', 'cltest002', 4, '08:00', '18:00', 30, 1, NOW(), NOW()),
  ('clavail012', 'cltest002', 5, '08:00', '18:00', 30, 1, NOW(), NOW()),
  ('clavail013', 'cltest002', 6, '09:00', '15:00', 30, 1, NOW(), NOW()),
  
  -- Eastside Center (Mon-Sat 9AM-7PM)
  ('clavail014', 'cltest003', 1, '09:00', '19:00', 30, 2, NOW(), NOW()),
  ('clavail015', 'cltest003', 2, '09:00', '19:00', 30, 2, NOW(), NOW()),
  ('clavail016', 'cltest003', 3, '09:00', '19:00', 30, 2, NOW(), NOW()),
  ('clavail017', 'cltest003', 4, '09:00', '19:00', 30, 2, NOW(), NOW()),
  ('clavail018', 'cltest003', 5, '09:00', '19:00', 30, 2, NOW(), NOW()),
  ('clavail019', 'cltest003', 6, '09:00', '19:00', 30, 2, NOW(), NOW());