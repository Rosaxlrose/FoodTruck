-- Sample Users
do $$
begin
  insert into auth.users (id, email)
  values 
    ('d7bed72c-cc26-4012-91c1-5063c8cc0c5b', 'mango@example.com'),
    ('e8bed72c-cc26-4012-91c1-5063c8cc0c5c', 'padthai@example.com'),
    ('f9bed72c-cc26-4012-91c1-5063c8cc0c5d', 'coffee@example.com'),
    ('a5bed72c-cc26-4012-91c1-5063c8cc0c5e', 'event1@example.com'),
    ('b6bed72c-cc26-4012-91c1-5063c8cc0c5f', 'event2@example.com'),
    ('c7bed72c-cc26-4012-91c1-5063c8cc0c52', 'event3@example.com');
exception 
  when unique_violation then null;
end $$;

-- Sample Profiles
INSERT INTO profiles (id, full_name, avatar_url, created_at)
VALUES
  ((SELECT id FROM auth.users ORDER BY created_at LIMIT 1), 
   'สมชาย ใจดี',
   'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1), 
   'สมหญิง รักดี',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users ORDER BY created_at OFFSET 2 LIMIT 1), 
   'มานี มีสุข',
   'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
   NOW()
  );

-- Sample Trucks
INSERT INTO trucks (id, name, description, cuisine_type, price_range, image_url, location, category, opening_hours, recommended_menu)
VALUES
  ('9693f63a-71e3-4a95-afae-c0858fa07c0d', 
   'บังบ่าวข้าวมันไก่',
   'ข้าวมันไก่สูตรต้นตำรับ เนื้อไก่นุ่ม น้ำจิ้มรสเด็ด',
   'อาหารตามสั่ง',
   '฿',
   'https://images.unsplash.com/photo-1617622141573-2e00d8810ef9?w=800',
   '{"lat": 13.756331, "lng": 100.506974}',
   'ข้าวมันไก่',
   '{"monday": {"open": "07:00", "close": "15:00"}, "tuesday": {"open": "07:00", "close": "15:00"}, "wednesday": {"open": "07:00", "close": "15:00"}, "thursday": {"open": "07:00", "close": "15:00"}, "friday": {"open": "07:00", "close": "15:00"}, "saturday": {"open": "07:00", "close": "15:00"}, "sunday": {"open": "07:00", "close": "15:00"}}',
   '[{"name": "ข้าวมันไก่ต้มพิเศษ", "price": 50, "description": "ข้าวมันไก่ต้มเสิร์ฟพร้อมน้ำซุปและน้ำจิ้มสูตรพิเศษ"}, {"name": "ข้าวมันไก่ทอด", "price": 45, "description": "ข้าวมันไก่ทอดกรอบ เสิร์ฟพร้อมน้ำจิ้มสูตรเด็ด"}]'
  ),
  ('b693f63a-71e3-4a95-afae-c0858fa07c0e',
   'พี่ตู่ผัดไทย',
   'ผัดไทยกุ้งสดรสเด็ด เส้นนุ่ม กุ้งแม่น้ำตัวใหญ่',
   'อาหารตามสั่ง',
   '฿',
   'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
   '{"lat": 13.756331, "lng": 100.506974}',
   'ผัดไทย',
   '{"monday": {"open": "10:00", "close": "20:00"}, "tuesday": {"open": "10:00", "close": "20:00"}, "wednesday": {"open": "10:00", "close": "20:00"}, "thursday": {"open": "10:00", "close": "20:00"}, "friday": {"open": "10:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "20:00"}, "sunday": {"open": "10:00", "close": "20:00"}}',
   '[{"name": "ผัดไทยกุ้งสด", "price": 60, "description": "ผัดไทยกุ้งแม่น้ำสด เส้นนุ่ม รสชาติดั้งเดิม"}, {"name": "ผัดไทยทะเล", "price": 80, "description": "ผัดไทยรวมทะเล กุ้ง หอย ปลาหมึก"}]'
  ),
  ('c693f63a-71e3-4a95-afae-c0858fa07c0f',
   'น้าหมูกระทะซีฟู้ด',
   'อาหารทะเลสดใหม่ทุกวัน เมนูหลากหลาย',
   'อาหารทะเล',
   '฿฿',
   'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800',
   '{"lat": 13.756331, "lng": 100.506974}',
   'ซีฟู้ด',
   '{"monday": {"open": "16:00", "close": "00:00"}, "tuesday": {"open": "16:00", "close": "00:00"}, "wednesday": {"open": "16:00", "close": "00:00"}, "thursday": {"open": "16:00", "close": "00:00"}, "friday": {"open": "16:00", "close": "00:00"}, "saturday": {"open": "16:00", "close": "00:00"}, "sunday": {"open": "16:00", "close": "00:00"}}',
   '[{"name": "กุ้งเผา", "price": 300, "description": "กุ้งแม่น้ำเผาเสิร์ฟพร้อมน้ำจิ้มซีฟู้ด"}, {"name": "ปลากะพงนึ่งมะนาว", "price": 250, "description": "ปลากะพงนึ่งมะนาว รสชาติจัดจ้าน"}]'
  );

-- Sample Reviews
INSERT INTO reviews (truck_id, user_id, rating, comment, images, created_at)
VALUES
  ((SELECT id FROM trucks ORDER BY RANDOM() LIMIT 1), 
   (SELECT id FROM auth.users ORDER BY created_at LIMIT 1),
   5,
   'อาหารอร่อยมาก บริการดีเยี่ยม แนะนำเลยครับ',
   ARRAY['https://images.unsplash.com/photo-1624374053855-39a5a1a41402?w=800'],
   NOW() - interval '2 days'
  ),
  ((SELECT id FROM trucks ORDER BY RANDOM() LIMIT 1), 
   (SELECT id FROM auth.users ORDER BY created_at OFFSET 1 LIMIT 1),
   4,
   'รสชาติดี บรรยากาศดี แต่ราคาค่อนข้างสูง',
   ARRAY['https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800'],
   NOW() - interval '1 day'
  ),
  ((SELECT id FROM trucks ORDER BY RANDOM() LIMIT 1), 
   (SELECT id FROM auth.users ORDER BY created_at OFFSET 2 LIMIT 1),
   5,
   'คุ้มค่าเงินมาก อาหารสดใหม่ บริการประทับใจ',
   ARRAY['https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800'],
   NOW()
  );

-- Sample Events
insert into events (name, description, image_url, start_date, end_date, location, registration_fee, max_trucks, organizer_id)
values
('Bangkok Street Food Festival', 'เทศกาลอาหารริมทางที่ใหญ่ที่สุดในกรุงเทพ', 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800', '2024-02-15 10:00:00+07', '2024-02-17 22:00:00+07', 'สวนลุมพินี', 100, 20, 'a5bed72c-cc26-4012-91c1-5063c8cc0c5e'),
('Night Market Mania', 'ตลาดกลางคืนสุดชิค พร้อมดนตรีสด', 'https://images.unsplash.com/photo-1545355628-3142665e4083?w=800', '2024-03-01 16:00:00+07', '2024-03-03 00:00:00+07', 'เจริญกรุง', 0, 15, 'b6bed72c-cc26-4012-91c1-5063c8cc0c5f'),
('Food Truck Rally', 'รวมพลคนรักฟู้ดทรัค พร้อมกิจกรรมสนุกๆ', 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800', '2024-03-15 11:00:00+07', '2024-03-15 21:00:00+07', 'สามย่าน', 50, 10, 'c7bed72c-cc26-4012-91c1-5063c8cc0c52')
on conflict (id) do update 
set name = excluded.name,
    description = excluded.description,
    image_url = excluded.image_url,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    location = excluded.location,
    registration_fee = excluded.registration_fee,
    max_trucks = excluded.max_trucks;
