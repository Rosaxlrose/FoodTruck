-- Enable PostGIS extension if not already enabled
create extension if not exists postgis;

-- Add geometry column to trucks table
alter table trucks 
add column if not exists location geometry(Point, 4326);

-- Create function to update location from lat/lng
create or replace function update_truck_location()
returns trigger as $$
begin
  new.location := ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 4326);
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update location
create trigger update_truck_location_trigger
before insert or update of latitude, longitude on trucks
for each row
execute function update_truck_location();

-- Create function to find nearby trucks
create or replace function nearby_trucks(
  search_lat float,
  search_lng float,
  radius_meters float
)
returns table (
  id uuid,
  name text,
  description text,
  image_url text,
  latitude float,
  longitude float,
  distance float
) as $$
begin
  return query
  select
    t.id,
    t.name,
    t.description,
    t.image_url,
    ST_Y(t.location::geometry) as latitude,
    ST_X(t.location::geometry) as longitude,
    ST_Distance(
      t.location,
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326),
      true
    ) as distance
  from trucks t
  where ST_DWithin(
    t.location,
    ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326),
    radius_meters
  )
  order by distance;
end;
$$ language plpgsql;

-- Create index for faster spatial queries
drop index if exists trucks_location_idx;
create index trucks_location_idx
on trucks using gist ((location::geometry));
