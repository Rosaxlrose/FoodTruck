# Food Truck Web Application

เว็บแอปพลิเคชันสำหรับจัดการร้าน Food Truck และอีเวนต์

## คุณสมบัติหลัก

- ระบบสมาชิก 3 ประเภท: ผู้ใช้ทั่วไป, เจ้าของร้าน, และผู้จัดงาน
- ระบบค้นหาร้านและอีเวนต์แบบ Fuzzy Search
- ระบบแผนที่แสดงตำแหน่งร้านและอีเวนต์
- ระบบให้คะแนนและรีวิว
- การจัดการเมนูอาหารสำหรับเจ้าของร้าน
- การจัดการอีเวนต์สำหรับผู้จัดงาน

## เทคโนโลยีที่ใช้

- React.js + Vite
- Tailwind CSS
- Supabase (Backend + Authentication)
- React Router
- React Icons
- SweetAlert2
- Fuse.js (Fuzzy Search)
- Google Maps API

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ .env และกำหนดค่าต่างๆ:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

3. รันโปรเจคในโหมด development:
```bash
npm run dev
```

## โครงสร้างโปรเจค

```
src/
  ├── components/     # React components
  ├── pages/         # หน้าต่างๆ ของแอป
  ├── hooks/         # Custom React hooks
  ├── utils/         # Utility functions
  ├── services/      # API services
  ├── assets/        # รูปภาพและไฟล์ static
  └── context/       # React context
