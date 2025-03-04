-- Drop existing functions first
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.record_analytics_event(text, jsonb, text) cascade;

-- Drop existing indexes if they exist
drop index if exists public.analytics_user_id_idx;
drop index if exists public.analytics_event_type_idx;
drop index if exists public.analytics_created_at_idx;
drop index if exists public.analytics_session_id_idx;

-- Create analytics table
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
create index if not exists analytics_user_id_idx on public.analytics(user_id);
create index if not exists analytics_event_type_idx on public.analytics(event_type);
create index if not exists analytics_created_at_idx on public.analytics(created_at);
create index if not exists analytics_session_id_idx on public.analytics(session_id);

-- Enable RLS
alter table public.analytics enable row level security;

-- Grant permissions
grant all on public.analytics to authenticated;

-- RLS Policies
create policy "Users can insert their own analytics"
    on public.analytics for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "Users can view their own analytics"
    on public.analytics for select
    to authenticated
    using (user_id = auth.uid());

create policy "Admins can view all analytics"
    on public.analytics for select
    to authenticated
    using (exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'admin'
    ));

-- Function to automatically set updated_at
create function public.handle_updated_at()
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