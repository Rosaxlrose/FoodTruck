-- Reviews table
create table if not exists truck_reviews (
  id uuid default uuid_generate_v4() primary key,
  truck_id uuid references trucks(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Drop existing policies if they exist
drop policy if exists "reviews_select_policy" on truck_reviews;
drop policy if exists "reviews_insert_policy" on truck_reviews;
drop policy if exists "reviews_update_policy" on truck_reviews;
drop policy if exists "reviews_delete_policy" on truck_reviews;

-- RLS Policies
alter table truck_reviews enable row level security;

create policy "reviews_select_policy"
  on truck_reviews for select
  using (true);

create policy "reviews_insert_policy"
  on truck_reviews for insert
  with check (
    auth.uid() = user_id and
    (
      select count(*) = 0
      from truck_reviews
      where truck_id = truck_reviews.truck_id
      and user_id = auth.uid()
    )
  );

create policy "reviews_update_policy"
  on truck_reviews for update
  using (auth.uid() = user_id);

create policy "reviews_delete_policy"
  on truck_reviews for delete
  using (auth.uid() = user_id);

-- Function to calculate average rating
create or replace function get_truck_rating(truck_uuid uuid)
returns table (
  average_rating numeric,
  total_reviews bigint
) as $$
begin
  return query
  select
    coalesce(round(avg(rating)::numeric, 1), 0) as average_rating,
    count(*) as total_reviews
  from truck_reviews
  where truck_id = truck_uuid;
end;
$$ language plpgsql;

-- Function to check if user can review
create or replace function can_review_truck(truck_uuid uuid, user_uuid uuid)
returns boolean as $$
begin
  return not exists (
    select 1 from truck_reviews
    where truck_id = truck_uuid
    and user_id = user_uuid
  );
end;
$$ language plpgsql;

-- Add trigger to update truck rating
create or replace function update_truck_rating()
returns trigger as $$
declare
  avg_rating numeric;
  review_count bigint;
  affected_truck_id uuid;
begin
  if (TG_OP = 'DELETE') then
    affected_truck_id := OLD.truck_id;
  else
    affected_truck_id := NEW.truck_id;
  end if;

  select * into avg_rating, review_count
  from get_truck_rating(affected_truck_id);
  
  update trucks
  set rating = avg_rating,
      review_count = review_count
  where id = affected_truck_id;
  
  if (TG_OP = 'DELETE') then
    return OLD;
  else
    return NEW;
  end if;
end;
$$ language plpgsql;

drop trigger if exists update_truck_rating_trigger on truck_reviews;

create trigger update_truck_rating_trigger
after insert or update or delete on truck_reviews
for each row
execute function update_truck_rating();

-- Add rating and review_count columns to trucks table if not exists
do $$ 
begin
  begin
    alter table trucks add column rating numeric default 0;
  exception
    when duplicate_column then null;
  end;
  
  begin
    alter table trucks add column review_count bigint default 0;
  exception
    when duplicate_column then null;
  end;
end $$;
