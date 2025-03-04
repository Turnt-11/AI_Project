-- Create contact messages table
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Create policy to allow inserting messages
create policy "Anyone can insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Create policy to allow admins to view messages
create policy "Admins can view contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Update contact messages table to allow null user_id
alter table public.contact_messages 
  alter column user_id drop not null; 