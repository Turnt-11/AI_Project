-- Create site settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_title TEXT DEFAULT 'My Site',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.site_settings (id, site_title)
VALUES (1, 'My Site')
ON CONFLICT (id) DO NOTHING; 