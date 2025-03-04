-- Create an analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Sessions table to track user visits
CREATE TABLE IF NOT EXISTS analytics.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    ip_address TEXT,
    user_agent TEXT,
    is_mobile BOOLEAN,
    referrer TEXT
);

-- Page views table
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES analytics.sessions(id),
    user_id UUID REFERENCES auth.users(id),
    page_path TEXT,
    view_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent INTEGER, -- in seconds
    exit_page BOOLEAN DEFAULT false
);

-- Create a view for daily statistics
CREATE OR REPLACE VIEW analytics.daily_stats AS
SELECT 
    DATE_TRUNC('day', session_start) as date,
    COUNT(DISTINCT user_id) as unique_visitors,
    COUNT(*) as total_sessions,
    AVG(duration) as avg_session_duration
FROM analytics.sessions
GROUP BY DATE_TRUNC('day', session_start)
ORDER BY date DESC;

-- Function to update session duration
CREATE OR REPLACE FUNCTION analytics.update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_duration_trigger
    BEFORE UPDATE ON analytics.sessions
    FOR EACH ROW
    WHEN (NEW.session_end IS NOT NULL)
    EXECUTE FUNCTION analytics.update_session_duration();

-- RLS Policies
ALTER TABLE analytics.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.page_views ENABLE ROW LEVEL SECURITY;

-- Allow admins full access
CREATE POLICY "Allow full access to admins" ON analytics.sessions
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    );

CREATE POLICY "Allow full access to admins" ON analytics.page_views
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'
        )
    ); 