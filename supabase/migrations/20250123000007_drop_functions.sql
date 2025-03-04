-- Drop all functions and their dependencies first to avoid conflicts
drop function if exists public.get_popular_pages cascade;
drop function if exists public.get_popular_pages() cascade;
drop function if exists public.handle_updated_at cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.update_daily_stats cascade;
drop function if exists public.update_daily_stats() cascade;
drop function if exists public.record_analytics_event(text, jsonb, text) cascade;

-- Drop any triggers that might be using these functions
drop trigger if exists set_updated_at on public.analytics cascade;
drop trigger if exists on_session_created on public.sessions cascade; 