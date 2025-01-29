-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists postgis;

-- Drop existing tables
drop table if exists event_trucks cascade;
drop table if exists events cascade;
drop table if exists trucks cascade;
drop table if exists profiles cascade;
drop table if exists reviews cascade;

-- Profiles table
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);

-- Trucks table
create table if not exists trucks (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  name text not null,
  description text,
  image_url text,
  category text not null,
  opening_hours jsonb not null default '{
    "monday": {"open": "10:00", "close": "20:00"},
    "tuesday": {"open": "10:00", "close": "20:00"},
    "wednesday": {"open": "10:00", "close": "20:00"},
    "thursday": {"open": "10:00", "close": "20:00"},
    "friday": {"open": "10:00", "close": "20:00"},
    "saturday": {"open": "10:00", "close": "20:00"},
    "sunday": {"open": "10:00", "close": "20:00"}
  }',
  cuisine_type text not null,
  recommended_menu jsonb not null default '[]',
  price_range text not null,
  latitude numeric,
  longitude numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table trucks enable row level security;

create policy "Trucks are viewable by everyone" on trucks
  for select using (true);

create policy "Users can insert their own trucks" on trucks
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own trucks" on trucks
  for update using (auth.uid() = owner_id);

create policy "Users can delete own trucks" on trucks
  for delete using (auth.uid() = owner_id);

-- Events table
create table events (
  id uuid default uuid_generate_v4() primary key,
  organizer_id uuid references profiles(id) not null,
  name text not null,
  description text,
  location text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  max_trucks integer default 10 not null,
  registration_fee decimal(10,2) default 0 not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for events
alter table events enable row level security;
create policy "Events are viewable by everyone." on events for select using (true);
create policy "Users can insert their own events." on events for insert with check (auth.uid() = organizer_id);
create policy "Users can update their own events." on events for update using (auth.uid() = organizer_id);
create policy "Users can delete their own events." on events for delete using (auth.uid() = organizer_id);

-- Reviews table
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  truck_id uuid references trucks(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table reviews enable row level security;

create policy "Reviews are viewable by everyone" on reviews
  for select using (true);

create policy "Users can insert their own reviews" on reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update own reviews" on reviews
  for update using (auth.uid() = user_id);

create policy "Users can delete own reviews" on reviews
  for delete using (auth.uid() = user_id);

-- Table: event_trucks
CREATE TABLE event_trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, truck_id)
);

-- RLS Policies for event_trucks
ALTER TABLE event_trucks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event_trucks"
  ON event_trucks FOR SELECT
  USING (true);

CREATE POLICY "Event owners can manage event_trucks"
  ON event_trucks FOR ALL
  USING (
    auth.uid() IN (
      SELECT organizer_id FROM events WHERE id = event_id
    )
  );

CREATE POLICY "Truck owners can manage their participation"
  ON event_trucks FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM trucks WHERE id = truck_id
    )
  );
