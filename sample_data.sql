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
  ((SELECT id FROM auth.users WHERE email = 'mango@example.com'), 
   'สมชาย ใจดี',
   'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users WHERE email = 'padthai@example.com'), 
   'สมหญิง รักดี',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users WHERE email = 'coffee@example.com'), 
   'มานี มีสุข',
   'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users WHERE email = 'event1@example.com'), 
   'วิชัย จัดงาน',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users WHERE email = 'event2@example.com'), 
   'สุดา อีเวนต์',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
   NOW()
  ),
  ((SELECT id FROM auth.users WHERE email = 'event3@example.com'), 
   'ประชา ออแกไนซ์',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
   NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url;

-- Sample Trucks
INSERT INTO trucks (id, owner_id, name, description, cuisine_type, price_range, image_url, latitude, longitude, category, opening_hours, recommended_menu)
VALUES
  ('9693f63a-71e3-4a95-afae-c0858fa07c0d',
   (SELECT id FROM auth.users WHERE email = 'mango@example.com'),
   'บังบ่าวข้าวมันไก่',
   'ข้าวมันไก่สูตรต้นตำรับ เนื้อไก่นุ่ม น้ำจิ้มรสเด็ด',
   'อาหารตามสั่ง',
   '฿',
   'https://images.unsplash.com/photo-1617622141573-2e00d8810ef9?w=800',
   13.756331,
   100.506974,
   'ข้าวมันไก่',
   '{"monday": {"open": "07:00", "close": "15:00"}, "tuesday": {"open": "07:00", "close": "15:00"}, "wednesday": {"open": "07:00", "close": "15:00"}, "thursday": {"open": "07:00", "close": "15:00"}, "friday": {"open": "07:00", "close": "15:00"}, "saturday": {"open": "07:00", "close": "15:00"}, "sunday": {"open": "07:00", "close": "15:00"}}',
   '[{"name": "ข้าวมันไก่ต้มพิเศษ", "price": 50, "description": "ข้าวมันไก่ต้มเสิร์ฟพร้อมน้ำซุปและน้ำจิ้มสูตรพิเศษ"}, {"name": "ข้าวมันไก่ทอด", "price": 45, "description": "ข้าวมันไก่ทอดกรอบ เสิร์ฟพร้อมน้ำจิ้มสูตรเด็ด"}]'
  ),
  ('a693f63a-71e3-4a95-afae-c0858fa07c0e',
   (SELECT id FROM auth.users WHERE email = 'padthai@example.com'),
   'พี่ตู่ผัดไทย',
   'ผัดไทยกุ้งสดรสเด็ด เส้นนุ่ม หอมกลิ่นผัดไทยแท้',
   'อาหารไทย',
   '฿',
   'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800',
   13.755331,
   100.505974,
   'ผัดไทย',
   '{"monday": {"open": "10:00", "close": "20:00"}, "tuesday": {"open": "10:00", "close": "20:00"}, "wednesday": {"open": "10:00", "close": "20:00"}, "thursday": {"open": "10:00", "close": "20:00"}, "friday": {"open": "10:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "20:00"}, "sunday": {"open": "10:00", "close": "20:00"}}',
   '[{"name": "ผัดไทยกุ้งสด", "price": 60, "description": "ผัดไทยกุ้งสดใหญ่ เส้นนุ่ม หอมกลิ่นผัดไทยแท้"}, {"name": "ผัดไทยทะเล", "price": 80, "description": "ผัดไทยรวมทะเล กุ้ง หมึก หอย"}]'
  ),
  ('b693f63a-71e3-4a95-afae-c0858fa07c0f',
   (SELECT id FROM auth.users WHERE email = 'coffee@example.com'),
   'น้าหมูกระทะซีฟู้ด',
   'อาหารทะเลสดใหม่ ปิ้งย่างสไตล์ญี่ปุ่น',
   'อาหารทะเล',
   '฿฿',
   'https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?w=800',
   13.754331,
   100.504974,
   'บุฟเฟ่ต์',
   '{"monday": {"open": "16:00", "close": "24:00"}, "tuesday": {"open": "16:00", "close": "24:00"}, "wednesday": {"open": "16:00", "close": "24:00"}, "thursday": {"open": "16:00", "close": "24:00"}, "friday": {"open": "16:00", "close": "24:00"}, "saturday": {"open": "16:00", "close": "24:00"}, "sunday": {"open": "16:00", "close": "24:00"}}',
   '[{"name": "บุฟเฟ่ต์ทะเล", "price": 299, "description": "บุฟเฟ่ต์อาหารทะเลไม่อั้น 2 ชั่วโมง"}, {"name": "เซ็ทปิ้งย่าง A", "price": 499, "description": "เซ็ทอาหารทะเลสำหรับ 2-3 ท่าน"}]'
  );

-- Sample Reviews
INSERT INTO reviews (truck_id, user_id, rating, comment, images, created_at)
VALUES
  ((SELECT id FROM trucks WHERE name = 'บังบ่าวข้าวมันไก่'),
   (SELECT id FROM auth.users WHERE email = 'padthai@example.com'),
   5,
   'ข้าวมันไก่อร่อยมาก เนื้อไก่นุ่ม น้ำจิ้มรสเด็ด',
   ARRAY['https://images.unsplash.com/photo-1617622141573-2e00d8810ef9'],
   NOW()
  ),
  ((SELECT id FROM trucks WHERE name = 'พี่ตู่ผัดไทย'),
   (SELECT id FROM auth.users WHERE email = 'mango@example.com'),
   4,
   'ผัดไทยรสชาติดี กุ้งสดมาก',
   ARRAY['https://images.unsplash.com/photo-1559314809-0d155014e29e'],
   NOW()
  ),
  ((SELECT id FROM trucks WHERE name = 'น้าหมูกระทะซีฟู้ด'),
   (SELECT id FROM auth.users WHERE email = 'event1@example.com'),
   5,
   'อาหารทะเลสดมาก บริการดีเยี่ยม',
   ARRAY['https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389'],
   NOW()
  );

-- Sample Events
INSERT INTO events (id, organizer_id, name, description, location, start_date, end_date, max_trucks, registration_fee, image_url)
VALUES
  ('d693f63a-71e3-4a95-afae-c0858fa07c0a',
   (SELECT id FROM auth.users WHERE email = 'event1@example.com'),
   'เทศกาลอาหารริมทาง',
   'งานรวมร้านอาหารริมทางชื่อดัง พร้อมกิจกรรมสนุกๆ มากมาย',
   'สวนลุมพินี',
   NOW() + interval '7 days',
   NOW() + interval '9 days',
   20,
   500.00,
   'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?w=800'
  ),
  ('e693f63a-71e3-4a95-afae-c0858fa07c0b',
   (SELECT id FROM auth.users WHERE email = 'event2@example.com'),
   'ตลาดนัดกลางคืน',
   'ตลาดนัดสุดฮิป รวมร้านอาหารสตรีทฟู้ด และดนตรีสด',
   'ลาน Central World',
   NOW() + interval '14 days',
   NOW() + interval '16 days',
   15,
   800.00,
   'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=800'
  ),
  ('f693f63a-71e3-4a95-afae-c0858fa07c0c',
   (SELECT id FROM auth.users WHERE email = 'event3@example.com'),
   'เทศกาลอาหารนานาชาติ',
   'สัมผัสรสชาติอาหารจากทั่วโลก พร้อมการแสดงวัฒนธรรม',
   'ไอคอนสยาม',
   NOW() + interval '21 days',
   NOW() + interval '23 days',
   25,
   1000.00,
   'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  max_trucks = EXCLUDED.max_trucks,
  registration_fee = EXCLUDED.registration_fee,
  image_url = EXCLUDED.image_url;

-- Sample Event Trucks
INSERT INTO event_trucks (event_id, truck_id, status)
VALUES
  ((SELECT id FROM events ORDER BY created_at LIMIT 1),
   (SELECT id FROM trucks WHERE name = 'บังบ่าวข้าวมันไก่'),
   'approved'),
  ((SELECT id FROM events ORDER BY created_at LIMIT 1),
   (SELECT id FROM trucks WHERE name = 'พี่ตู่ผัดไทย'),
   'approved'),
  ((SELECT id FROM events ORDER BY created_at OFFSET 1 LIMIT 1),
   (SELECT id FROM trucks WHERE name = 'บังบ่าวข้าวมันไก่'),
   'pending'),
  ((SELECT id FROM events ORDER BY created_at OFFSET 1 LIMIT 1),
   (SELECT id FROM trucks WHERE name = 'น้าหมูกระทะซีฟู้ด'),
   'approved');
