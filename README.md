# Supporters Cartoon

แฟนไซต์ของ **Cartoon BNK48** รวมประวัติศิลปิน กิจกรรม ผลงาน และช่องทางการติดตาม

> เว็บนี้เป็นแฟนไซต์ ไม่ใช่เว็บทางการของ BNK48 รูปภาพและวิดีโอเป็นลิขสิทธิ์ของเจ้าของผลงาน

## เริ่มใช้งาน

```bash
npm install
npm start      # เปิด http://localhost:3000
npm test       # รันเทสต์ (ต้องรันผ่าน npm เพื่อให้ได้เลขเวอร์ชัน)
npm run build  # สร้างไฟล์สำหรับ deploy ไว้ในโฟลเดอร์ build/
```

## โครงสร้าง

```
src/
  App.js          header, เมนู และ routes
  Home.js         หน้าหลัก (hero + โปรไฟล์ศิลปิน + งานถัดไป)
  Event.js        กิจกรรม
  Ticket.js       ตั๋วกิจกรรม ใช้ร่วมกันในหน้าหลักและหน้ากิจกรรม
  data/countdown.js นับถอยหลังถึงงานถัดไป (อ่านเวลาเริ่มจากบรรทัดแรกของ schedule ตามเวลาไทย)
  Work.js         วิดีโอ (คลิป YouTube)
  Support.js      ซัพพอร์ต (OPC, TikTok และ X แฟนคลับ)
  GameHub.js      หน้ารวมเกม
  NaamtokGame.js  เกมน้ำตกไม่ผัก (logic อยู่ใน game/naamtok.js)
  NextGirlsGame.js  เกม Stage Runner (logic อยู่ใน game/nextGirls.js · URL และ key ข้อมูลยังเป็น next-girls)
  game/           logic เกม, pixel art ที่ใช้ร่วมกัน (pixel.js) และสถิติ/แชร์ (shared.js)
  Leaderboard.js  ตารางอันดับรวม + ช่องลงชื่อหลังจบรอบ (คุยกับ api/scores.js)
  QuizGame.js     ควิซ "รู้จักน้องการ์ตูนแค่ไหน?" (คำถามสร้างจาก artist.json / videos.json ใน game/quiz.js)
  FanCardMaker.js ทำบัตรแฟนคลับ บันทึกเป็นรูป 1080 × 1920 (วาดใน game/fanCard.js)
  RunHistory.js   ประวัติ 5 รอบล่าสุดในเครื่อง
api/
  scores.js       Vercel Function ของตารางอันดับรวม เก็บใน Upstash Redis
  Footer.js       ช่องทางการติดตาม แสดงท้ายทุกหน้า
  icons.js        ไอคอนเส้นที่ใช้ในปุ่มและการ์ด
  index.css       สี ฟอนต์ และคอมโพเนนต์ที่ใช้ทุกหน้า (เทปกาว, สติกเกอร์, ปุ่ม)
  data/           ข้อมูลทั้งหมดของเว็บ
public/images/    รูปภาพ
```

## อัปเดตข้อมูล

แก้ไฟล์ใน `src/data/` ได้เลย ไม่ต้องแก้โค้ดของหน้าเว็บ

| ไฟล์ | ใช้กับ | หมายเหตุ |
| --- | --- | --- |
| `artist.json` | หน้าหลัก, footer | `birthDate` ใช้รูปแบบ `YYYY-MM-DD` · `source` คือที่มาของข้อมูล แสดงใต้ข้อมูลส่วนตัว |
| `events.json` | กิจกรรม | ต้องมี `title` และ `date` (`YYYY-MM-DD`) ใส่เพิ่มได้: `location`, `schedule` (รายการเวลา), `note`, `poster` (รูปใน `public/images/events/`), `links` (`label` + `url`) งานจะแยกเป็น "ตั๋วที่กำลังจะใช้" / "ตั๋วที่เก็บไว้" ตามวันที่เอง งานที่ใกล้ที่สุดจะขึ้นในหน้าหลักด้วย |
| `videos.json` | วิดีโอ | แบ่งเป็นหมวด (`categories`) แต่ละคลิปมี `title` และ `url` แบบ embed ของ YouTube (`https://www.youtube.com/embed/...`) ใส่ `date` (วันที่ลงคลิป) ได้ ชื่อหมวดจะกลายเป็นปุ่มกรองเอง หมวดที่ตั้ง `"sort": "newest"` จะเรียงคลิปใหม่สุดขึ้นก่อนเอง |
| `socials.json` | footer | แต่ละรายการมี `name` และ `url` |
| `support.json` | ซัพพอร์ต | รายการช่องทาง แต่ละอันมี `title`, `description` และใส่ `qr` (รูปใน `public/images/support/`), `url` + `label` (ข้อความบนปุ่ม) ได้ |

วันที่จะแสดงเป็นรูปแบบไทยอัตโนมัติ เช่น `2009-08-26` → `26 ส.ค. 2552`

## เลขเวอร์ชัน

เลขเวอร์ชันที่มุมขวาล่างของเว็บมาจาก `"version"` ใน `package.json` เวลาปล่อยเวอร์ชันใหม่ ใช้คำสั่ง

```bash
npm version patch --no-git-tag-version   # 1.0.0 → 1.0.1 แก้เล็กน้อย
npm version minor --no-git-tag-version   # 1.0.0 → 1.1.0 เพิ่มส่วนใหม่
```

## ตารางอันดับเกม

ตารางอันดับรวม (ทุกคนเห็นเหมือนกัน) ใช้ `api/scores.js` บน Vercel เก็บข้อมูลใน Upstash Redis

1. Vercel → โปรเจกต์นี้ → **Storage** → **Create Database** → **Upstash for Redis** (แผนฟรีพอ) → Connect กับโปรเจกต์
2. Vercel จะใส่ `KV_REST_API_URL` และ `KV_REST_API_TOKEN` ให้เอง (หรือใช้ `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` ก็ได้)
3. Redeploy แล้วตารางอันดับจะใช้งานได้

- เก็บแค่ชื่อเล่น (ไม่เกิน 16 ตัวอักษร) กับคะแนน ชื่อเดิมเก็บเฉพาะคะแนนที่ดีที่สุด
- ส่งได้ 5 ครั้งต่อนาทีต่อ IP เป็นตารางเล่นสนุก ไม่ได้กันโกงจริงจัง
- ลบชื่อที่ไม่เหมาะสมได้จาก Upstash Console: `ZREM leaderboard:naamtok <ชื่อ>` (หรือ `leaderboard:next-girls`)
- ตอนรัน `npm start` ในเครื่องจะไม่มี `/api` ตารางจะขึ้นว่า "ยังโหลดตารางอันดับไม่ได้" ซึ่งเป็นปกติ
