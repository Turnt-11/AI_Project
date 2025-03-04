-- Drop existing schema and functions
drop schema if exists analytics cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.record_analytics_event(text, jsonb, text) cascade;
drop function if exists public.get_popular_pages() cascade;
drop function if exists public.update_daily_stats() cascade;

-- Drop existing indexes if they exist
drop index if exists public.analytics_user_id_idx;
drop index if exists public.analytics_event_type_idx;
drop index if exists public.analytics_created_at_idx;
drop index if exists public.analytics_session_id_idx;

-- Create tables in public schema
create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    session_start timestamp with time zone default now(),
    session_end timestamp with time zone,
    ip_address text,
    user_agent text,
    is_mobile boolean,
    referrer text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.page_views (
    id uuid primary key default gen_random_uuid(),
    session_id uuid references public.sessions(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    page_path text,
    view_timestamp timestamp with time zone default now(),
    time_spent integer,
    exit_page boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.daily_stats (
    id uuid primary key default gen_random_uuid(),
    date date not null default current_date,
    visits integer not null default 0,
    unique_visitors integer not null default 0,
    avg_session_duration interval,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(date)
);

create table if not exists public.analytics (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    event_type text not null,
    event_data jsonb default '{}'::jsonb,
    page_path text,
    session_id uuid references public.sessions(id) on delete set null,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index analytics_user_id_idx on public.analytics(user_id);
create index analytics_event_type_idx on public.analytics(event_type);
create index analytics_created_at_idx on public.analytics(created_at);
create index analytics_session_id_idx on public.analytics(session_id);

-- Enable RLS
alter table public.sessions enable row level security;
alter table public.page_views enable row level security;
alter table public.daily_stats enable row level security;
alter table public.analytics enable row level security;

-- Grant permissions
grant all on public.sessions to authenticated;
grant all on public.page_views to authenticated;
grant all on public.daily_stats to authenticated;
grant all on public.analytics to authenticated;

-- RLS Policies for sessions
create policy "Allow users to create their own sessions"
    on public.sessions for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Allow users to update their own sessions"
    on public.sessions for update
    to authenticated
    using (user_id = auth.uid());

create policy "Allow admins to read all sessions"
    on public.sessions for select
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- RLS Policies for page_views
create policy "Allow users to create their own page views"
    on public.page_views for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Allow admins to read all page views"
    on public.page_views for select
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- RLS Policies for daily_stats
create policy "Allow admins to read daily stats"
    on public.daily_stats for select
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- RLS Policies for analytics
create policy "Allow users to create their own analytics events"
    on public.analytics for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Allow admins to read all analytics events"
    on public.analytics for select
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- Create base functions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
    before update on public.analytics
    for each row
    execute function public.handle_updated_at(); 