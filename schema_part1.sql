-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  role text not null check (role in ('user', 'restaurant_owner', 'event_organizer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for profiles
alter table profiles enable row level security;

create policy "profiles_select_policy"
  on profiles for select
  using (true);

create policy "profiles_insert_policy"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_policy"
  on profiles for update
  using (auth.uid() = id);
