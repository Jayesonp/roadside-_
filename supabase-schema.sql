-- RoadSide+ Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
    permissions TEXT[] DEFAULT ARRAY['read'],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service_type TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    assigned_technician_id UUID,
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    completion_time TIMESTAMPTZ,
    cost DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    technician_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE,
    profile_photo_url TEXT,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    availability_status BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_jobs INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 100.0,
    years_experience INTEGER DEFAULT 0,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    vehicle_info JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT UNIQUE NOT NULL,
    contact_phone TEXT NOT NULL,
    services_offered TEXT[] DEFAULT ARRAY[]::TEXT[],
    coverage_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_alerts table
CREATE TABLE IF NOT EXISTS public.system_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    affected_component TEXT,
    created_by UUID REFERENCES public.admin_users(id),
    resolved_by UUID REFERENCES public.admin_users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Admin users can view all admin users" ON public.admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can update their own profile" ON public.admin_users
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for service_requests (allow all operations for authenticated users)
CREATE POLICY "Authenticated users can view service requests" ON public.service_requests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert service requests" ON public.service_requests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update service requests" ON public.service_requests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for technicians
CREATE POLICY "Authenticated users can view technicians" ON public.technicians
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Technicians can update their own profile" ON public.technicians
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can manage technicians" ON public.technicians
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for technician_earnings
CREATE POLICY "Technicians can view their own earnings" ON public.technician_earnings
    FOR SELECT USING (
        technician_id IN (
            SELECT id FROM public.technicians WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can manage earnings" ON public.technician_earnings
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for technician_job_history
CREATE POLICY "Technicians can view their own job history" ON public.technician_job_history
    FOR SELECT USING (
        technician_id IN (
            SELECT id FROM public.technicians WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can manage job history" ON public.technician_job_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for partners
CREATE POLICY "Authenticated users can view partners" ON public.partners
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage partners" ON public.partners
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for system_alerts
CREATE POLICY "Authenticated users can view system alerts" ON public.system_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage system alerts" ON public.system_alerts
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.admin_users (id, email, name, role, permissions, status, email_verified) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@roadside.com', 'Demo Admin', 'super_admin', ARRAY['all'], 'active', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample service requests
INSERT INTO public.service_requests (customer_name, customer_phone, service_type, location, status, priority) VALUES
    ('John Smith', '+1-555-0123', 'Tire Change', '123 Main St, City', 'pending', 'medium'),
    ('Sarah Johnson', '+1-555-0124', 'Jump Start', '456 Oak Ave, City', 'in_progress', 'high'),
    ('Mike Wilson', '+1-555-0125', 'Towing', '789 Pine Rd, City', 'completed', 'low')
ON CONFLICT DO NOTHING;

-- Create technician_earnings table
CREATE TABLE IF NOT EXISTS public.technician_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
    service_request_id UUID REFERENCES public.service_requests(id),
    amount DECIMAL(10, 2) NOT NULL,
    service_type TEXT NOT NULL,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'digital', 'company')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'processing', 'failed')),
    bonus_amount DECIMAL(10, 2) DEFAULT 0.00,
    tip_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    earning_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create technician_job_history table
CREATE TABLE IF NOT EXISTS public.technician_job_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    technician_id UUID REFERENCES public.technicians(id) ON DELETE CASCADE,
    service_request_id UUID REFERENCES public.service_requests(id),
    job_status TEXT NOT NULL CHECK (job_status IN ('accepted', 'declined', 'completed', 'cancelled', 'in_progress')),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    customer_feedback TEXT,
    technician_notes TEXT,
    travel_distance DECIMAL(8, 2),
    service_duration INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample technicians
INSERT INTO public.technicians (technician_id, name, phone, email, specialties, status, certifications, years_experience) VALUES
    ('RSP-4857', 'Mike Chen', '+1-555-1001', 'mike@roadside.com', ARRAY['tire_change', 'jump_start', 'lockout'], 'available', ARRAY['ASE Certified', 'Emergency Response'], 5),
    ('RSP-3421', 'Alex Rodriguez', '+1-555-1002', 'alex@roadside.com', ARRAY['towing', 'recovery', 'tire_change'], 'busy', ARRAY['Towing Specialist', 'Heavy Vehicle'], 8),
    ('RSP-2156', 'Maria Garcia', '+1-555-1003', 'maria@roadside.com', ARRAY['lockout', 'jump_start', 'fuel_delivery'], 'available', ARRAY['Locksmith Certified', 'First Aid'], 3)
ON CONFLICT (email) DO NOTHING;

-- Insert sample earnings data
INSERT INTO public.technician_earnings (technician_id, amount, service_type, payment_status, net_amount, earning_date) VALUES
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-4857'), 120.00, 'tire_change', 'paid', 108.00, CURRENT_DATE - INTERVAL '1 day'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-4857'), 85.00, 'jump_start', 'paid', 76.50, CURRENT_DATE - INTERVAL '2 days'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-4857'), 200.00, 'towing', 'paid', 180.00, CURRENT_DATE - INTERVAL '3 days'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-3421'), 250.00, 'towing', 'paid', 225.00, CURRENT_DATE - INTERVAL '1 day'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-2156'), 75.00, 'lockout', 'paid', 67.50, CURRENT_DATE - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Insert sample job history
INSERT INTO public.technician_job_history (technician_id, job_status, customer_rating, service_duration, travel_distance, completed_at) VALUES
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-4857'), 'completed', 5, 45, 2.3, NOW() - INTERVAL '1 day'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-4857'), 'completed', 4, 30, 1.8, NOW() - INTERVAL '2 days'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-3421'), 'completed', 5, 60, 4.1, NOW() - INTERVAL '1 day'),
    ((SELECT id FROM public.technicians WHERE technician_id = 'RSP-2156'), 'completed', 5, 25, 1.2, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Insert sample partners
INSERT INTO public.partners (company_name, contact_name, contact_email, contact_phone, services_offered) VALUES
    ('Quick Tow Services', 'Bob Miller', 'bob@quicktow.com', '+1-555-2001', ARRAY['towing', 'recovery']),
    ('City Auto Repair', 'Lisa Brown', 'lisa@cityauto.com', '+1-555-2002', ARRAY['tire_change', 'jump_start', 'lockout']),
    ('Emergency Road Help', 'Tom Davis', 'tom@emergencyroad.com', '+1-555-2003', ARRAY['towing', 'tire_change', 'fuel_delivery'])
ON CONFLICT (contact_email) DO NOTHING;
