CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('emergency', 'registration', 'payment', 'completion', 'assignment', 'location', 'notification', 'system', 'security')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  user_name TEXT,
  location TEXT,
  amount TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE activities;

-- Insert sample data
INSERT INTO activities (type, title, description, priority, user_name, location, amount) VALUES
('emergency', 'Emergency Request', 'Battery jump start requested by Sarah Mitchell', 'high', 'Sarah Mitchell', 'Downtown Area', NULL),
('registration', 'New User Registration', 'joined as Premium Member', 'medium', 'Mike Johnson', NULL, NULL),
('payment', 'Payment Processed', 'Monthly subscription payment received', 'low', 'Emily Wilson', NULL, '$29.99'),
('completion', 'Service Completed', 'Tire change service completed successfully', 'medium', 'Alex Thompson', 'Highway 101', NULL),
('assignment', 'Technician Assigned', 'assigned to towing service request', 'medium', 'Mike Chen', 'Mall Parking', NULL),
('emergency', 'Panic Button Activated', 'Vehicle breakdown reported by John Davis', 'high', 'John Davis', 'Office Building', NULL),
('payment', 'Subscription Renewed', 'Premium membership renewed', 'low', 'Lisa Rodriguez', NULL, '$49.99'),
('completion', 'Request Fulfilled', 'Battery jump completed by David Kim', 'medium', 'David Kim', 'Residential Area', NULL),
('notification', 'System Alert', 'New technician available in your area', 'low', 'Anna Brown', 'Shopping Center', NULL),
('security', 'Security Check', 'Unusual login activity detected', 'high', 'Chris Taylor', NULL, NULL);
