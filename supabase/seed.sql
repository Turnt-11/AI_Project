BEGIN;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS public;

-- Drop existing tables in correct order (dependencies first)
DROP TABLE IF EXISTS analytics.page_views CASCADE;
DROP TABLE IF EXISTS analytics.sessions CASCADE;
DROP TABLE IF EXISTS analytics.daily_stats CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table first
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create site settings table
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_title TEXT DEFAULT 'My Site',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics tables
CREATE TABLE analytics.daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  unique_visitors INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  avg_session_duration FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics.page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES analytics.sessions(id),
  page_path TEXT NOT NULL,
  time_spent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.page_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON analytics.daily_stats;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON analytics.sessions;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON analytics.page_views;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow full access to authenticated users" ON analytics.daily_stats
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON analytics.sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to authenticated users" ON analytics.page_views
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to get popular pages
CREATE OR REPLACE FUNCTION public.get_popular_pages()
RETURNS TABLE (
  page_path TEXT,
  view_count BIGINT,
  avg_time_spent FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.page_path,
    COUNT(*) as view_count,
    AVG(pv.time_spent)::FLOAT as avg_time_spent
  FROM analytics.page_views pv
  GROUP BY pv.page_path
  ORDER BY view_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA analytics TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA analytics TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA analytics TO postgres, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO postgres, anon, authenticated, service_role;

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Insert default site settings
INSERT INTO public.site_settings (id, site_title)
VALUES (1, 'My Site')
ON CONFLICT (id) DO NOTHING;

COMMIT;