create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  site_title text not null default 'Matrix Dashboard',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings if none exist
insert into public.site_settings (site_title)
select 'Matrix Dashboard'
where not exists (select 1 from public.site_settings);

-- Add RLS policies
alter table public.site_settings enable row level security;

create policy "Allow public read access to site_settings"
  on public.site_settings for select
  to authenticated
  using (true);

create policy "Allow admins to update site_settings"
  on public.site_settings for update
  to authenticated
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )); 