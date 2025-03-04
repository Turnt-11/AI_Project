-- First drop any existing tables and policies
drop table if exists public.analytics cascade;
drop table if exists public.sessions cascade;
drop table if exists public.daily_stats cascade;

-- Create sessions table first (because analytics references it)
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) null,
  session_start timestamptz default now(),
  session_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create daily stats table
create table if not exists public.daily_stats (
  date date primary key,
  visits integer default 0,
  unique_visitors integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create analytics table last (because it has foreign keys)
create table if not exists public.analytics (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  user_id uuid references auth.users(id) null,
  session_id uuid references public.sessions(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table public.analytics enable row level security;
alter table public.sessions enable row level security;
alter table public.daily_stats enable row level security;

-- Drop existing policies
drop policy if exists "Users can view their own analytics" on public.analytics;
drop policy if exists "Admins can view all analytics" on public.analytics;
drop policy if exists "Users can view their own sessions" on public.sessions;
drop policy if exists "Users can insert their own sessions" on public.sessions;
drop policy if exists "Anyone can view daily stats" on public.daily_stats;
drop policy if exists "Allow anonymous sessions" on public.sessions;
drop policy if exists "Allow anonymous analytics" on public.analytics;

-- Create policies for authenticated users
create policy "Users can view their own analytics"
  on public.analytics for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can view their own sessions"
  on public.sessions for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own sessions"
  on public.sessions for insert
  to authenticated
  with check (user_id = auth.uid());

-- Create policies for anonymous users
create policy "Allow anonymous sessions"
  on public.sessions for insert
  to anon
  with check (user_id is null);

create policy "Allow anonymous analytics"
  on public.analytics for insert
  to anon
  with check (user_id is null);

-- Create policies for everyone
create policy "Anyone can view daily stats"
  on public.daily_stats for select
  to authenticated, anon
  using (true);

-- ... rest of the analytics tables code ... 