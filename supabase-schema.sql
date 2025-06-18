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
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE,
    specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    current_location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline')),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_jobs INTEGER DEFAULT 0,
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

CREATE POLICY "Authenticated users can manage technicians" ON public.technicians
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

-- Insert sample technicians
INSERT INTO public.technicians (name, phone, email, specialties, status) VALUES
    ('Alex Rodriguez', '+1-555-1001', 'alex@roadside.com', ARRAY['tire_change', 'jump_start'], 'available'),
    ('Maria Garcia', '+1-555-1002', 'maria@roadside.com', ARRAY['towing', 'lockout'], 'busy'),
    ('David Chen', '+1-555-1003', 'david@roadside.com', ARRAY['tire_change', 'towing', 'jump_start'], 'available')
ON CONFLICT (email) DO NOTHING;

-- Insert sample partners
INSERT INTO public.partners (company_name, contact_name, contact_email, contact_phone, services_offered) VALUES
    ('Quick Tow Services', 'Bob Miller', 'bob@quicktow.com', '+1-555-2001', ARRAY['towing', 'recovery']),
    ('City Auto Repair', 'Lisa Brown', 'lisa@cityauto.com', '+1-555-2002', ARRAY['tire_change', 'jump_start', 'lockout']),
    ('Emergency Road Help', 'Tom Davis', 'tom@emergencyroad.com', '+1-555-2003', ARRAY['towing', 'tire_change', 'fuel_delivery'])
ON CONFLICT (contact_email) DO NOTHING;
