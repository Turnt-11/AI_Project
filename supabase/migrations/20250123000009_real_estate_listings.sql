-- Drop existing table and function if they exist
drop table if exists public.real_estate_listings cascade;
drop function if exists public.handle_real_estate_updated_at() cascade;

create table if not exists public.real_estate_listings (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    price numeric not null,
    location text not null,
    bedrooms integer,
    bathrooms numeric,
    square_feet numeric,
    description text,
    image_url text,
    listing_url text not null,
    source_website text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ... rest of the real estate code ... 