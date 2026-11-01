# Supporters Cartoon

แฟนไซต์ของ **Cartoon BNK48** รวมประวัติศิลปิน กิจกรรม ผลงาน และช่องทางการติดตาม

> เว็บนี้เป็นแฟนไซต์ ไม่ใช่เว็บทางการของ BNK48 รูปภาพและวิดีโอเป็นลิขสิทธิ์ของเจ้าของผลงาน

## เริ่มใช้งาน

```bash
npm install
npm start      # เปิด http://localhost:3000
npm test       # รันเทสต์
npm run build  # สร้างไฟล์สำหรับ deploy ไว้ในโฟลเดอร์ build/
```

## โครงสร้าง

```
src/
  App.js          header, เมนู และ routes
  Home.js         หน้าหลัก (hero + โปรไฟล์ศิลปิน)
  Event.js        กิจกรรม
  Work.js         ผลงาน (วิดีโอ YouTube)
  Support.js      ซัพพอร์ต (QR เข้ากลุ่ม OPC)
  Footer.js       ช่องทางการติดตาม แสดงท้ายทุกหน้า
  data/           ข้อมูลทั้งหมดของเว็บ
public/images/    รูปภาพ
```

## อัปเดตข้อมูล

แก้ไฟล์ใน `src/data/` ได้เลย ไม่ต้องแก้โค้ดของหน้าเว็บ

| ไฟล์ | ใช้กับ | หมายเหตุ |
| --- | --- | --- |
| `artist.json` | หน้าหลัก, footer | `birthDate` ใช้รูปแบบ `YYYY-MM-DD` |
| `events.json` | กิจกรรม | แต่ละรายการมี `title` และ `date` (`YYYY-MM-DD`) |
| `videos.json` | ผลงาน | ใส่ลิงก์แบบ embed ของ YouTube (`https://www.youtube.com/embed/...`) |
| `socials.json` | footer | แต่ละรายการมี `name` และ `url` |
| `support.json` | ซัพพอร์ต | รูป QR อยู่ที่ `public/images/support/` ถ้าใส่ `url` จะมีปุ่ม "เปิดลิงก์" ใต้ QR |

วันที่จะแสดงเป็นรูปแบบไทยอัตโนมัติ เช่น `2009-08-26` → `26 ส.ค. 2552`
