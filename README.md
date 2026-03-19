## ระบบจัดการโครงการ SDG 4 (SDG 4 Project Management System)

ระบบบริหารโครงการ SDG 4 สำหรับหน่วยงานการศึกษา — สรุป/จัดการโครงการ, Dashboard, รายงานและ Export

โครงงานนี้เป็นส่วนหนึ่งของการศึกษา  
หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการข้อมูลและนวัตกรรมซอฟต์แวร์  
ภาควิชาคณิตศาสตร์ สถิติ และคอมพิวเตอร์ คณะวิทยาศาสตร์  
มหาวิทยาลัยอุบลราชธานี  
ปีการศึกษา 2568  
ลิขสิทธิ์ของมหาวิทยาลัยอุบลราชธานี  

---

### สมาชิกกลุ่ม

| ลำดับ | ชื่อ-นามสกุล | รหัสนักศึกษา | บทบาท |
|------|--------------|--------------|--------|
| 1 | นายอัครพนธ์ โอมาโฮนี่ | 6811400xxx | Login / Auth |
| 2 | นายไชยวัฒน์ ทำดี | 6811400xxx | Dashboard / Report |
| 3 | นายกฤษฎาพงษ์ ทิณพัฒน์ | 6811400xxx | Project Management |
| 4 | นายศิขรินทร์ ภูติโส | 6811400xxx | Organization |
| 5 | นายพิชชากร คำพรม | 6811400xxx | User / PIN |
| 6 | นายนัธทวัฒน์ เขาแก้ว | 6811400xxx | Audit Log |

**อาจารย์ที่ปรึกษา:** ................................................  

---

### 1. วัตถุประสงค์และขอบเขต

- **วัตถุประสงค์:** ให้หน่วยงานสามารถบันทึก/บริหารโครงการที่เกี่ยวข้องกับ SDG 4 ได้อย่างเป็นระบบ และมี Dashboard สรุปสถานะ
- **ขอบเขต:** รองรับ Organization, Project, User, PIN และ Audit Log; มีทั้ง Backend API และ Frontend SPA

---

### 2. Tech Stack / Framework

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Backend** | Python 3.x, Flask, Flask-SQLAlchemy, SQLite |
| **Frontend** | HTML / CSS / JavaScript (SPA), Tailwind CSS, DaisyUI, Chart.js, SweetAlert2 |

---

### 3. วิธีติดตั้งและรันระบบ

**ความต้องการของระบบ:** Python 3.10 ขึ้นไป, pip — **ไม่ต้องติดตั้ง Node.js**

**ตัวแปร Environment (ถ้าต้องการ):**
- `ADMIN_PIN` — กำหนด Admin PIN 6 หลักเอง (ไม่กำหนดจะ random)
- `SECRET_KEY` — สำหรับ session (production ควรตั้งค่า)
- `DATABASE_URL` — เชื่อมต่อ DB อื่น (default: SQLite)

1. โคลนโปรเจกต์แล้วเข้าโฟลเดอร์ backend:
   ```bash
   cd SDG/backend
   ```

2. สร้าง Virtual Environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate    # Windows
   # source .venv/bin/activate   # macOS / Linux
   ```

3. ติดตั้ง Dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. รันระบบ (Backend + Frontend พร้อมกัน):
   ```bash
   python run.py
   ```

5. เปิดเบราว์เซอร์ที่ `http://127.0.0.1:5000`

Flask จะเสิร์ฟทั้ง API และหน้าเว็บจากพอร์ตเดียว ฐานข้อมูล SQLite สร้างอัตโนมัติเมื่อรันครั้งแรก พร้อมเติมข้อมูลเริ่มต้น (admin, หน่วยงาน, โครงการตัวอย่าง) — Admin PIN แสดงใน banner ที่ terminal ตอนรัน

---

### ข้อมูลสำหรับทดสอบระบบ

| รายการ | ค่า | หมายเหตุ |
|--------|-----|----------|
| Admin | เลือก **Admin** จาก dropdown / PIN | PIN แสดงใน banner ตอนรันเซิร์ฟเวอร์ หรือกำหนดผ่าน env `ADMIN_PIN` |
| Manager หน่วยงาน | เลือกหน่วยงาน / PIN | แต่ละหน่วยงานมี PIN สุ่มไม่ซ้ำกัน Admin ดูได้จากหน้าจัดการหน่วยงาน |
| PIN | 6 หลัก | Admin และหน่วยงานใช้ random ไม่ซ้ำกัน — เพื่อความปลอดภัย |

---

### 4. โครงสร้างไฟล์หลัก

#### Backend (`backend/`)

```text
backend/
  app/
    __init__.py           # create_app + register_blueprints
    config.py             # การตั้งค่า Flask/DB (ADMIN_PIN จาก env)
    database.py           # db = SQLAlchemy() — การเชื่อมต่อฐานข้อมูล
    initial_data.py       # เติมข้อมูลเริ่มต้น — Admin/หน่วยงานใช้ random PIN ไม่ซ้ำ
    models.py             # โครง model หลัก (Org, User, Project, AuditLog, ...)
    utils.py              # random_pin_6, generate_unique_org_pin, require_admin, ...
    routes/
      auth_routes.py      # Login / Logout / Current user
      dashboard_routes.py # Dashboard summary
      project_routes.py   # Project CRUD
      report_routes.py    # รายงาน / Export โครงการ
      org_routes.py       # Organization management
      pin_routes.py       # ตั้งค่า PIN หน่วยงาน
      user_routes.py      # User & role management
      audit_routes.py     # Audit log
      data_routes.py      # Sync / full data (ใช้สำหรับ Frontend)
  run.py                  # จุดรันหลัก — แสดง banner + Admin PIN
  requirements.txt        # รายการ Python packages
```

### Frontend

- `frontend/`
  - `index.html` – หน้าเว็บหลัก
  - `styles.css` – สไตล์ (Tailwind, DaisyUI)
  - `js/`
    - `app.js` – จุดเริ่มต้นแอป
    - `router.js` – routing หน้า
    - `auth/login.js` – หน้าเข้าสู่ระบบ
    - `pages/` – หน้า Dashboard, Projects, Organizations, Users, Audit
    - `core/api.js` – คลient เรียก API
    - `core/store.js`, `core/utils.js`, `core/alerts.js`
    - `config/constants.js` – ค่าคงที่รวม SDG targets
- `prototype/` – prototype ดั้งเดิม (browser + localStorage)

---

## Route & Maintainer Table

เงื่อนไข: **สมาชิกทุกคนต้องดูแลอย่างน้อย 2 routes**  
ด้านล่างนี้เป็นการ mapping route → file → ผู้ดูแล

### 1) นายอัครพนธ์ โอมาโฮนี่ (Login System / Authenticate & Validate)

- File: `app/routes/auth_routes.py`

| HTTP | URL                    | Description                      | Maintainer                 |
|------|------------------------|----------------------------------|----------------------------|
| POST | `/api/auth/login`      | เข้าสู่ระบบ                     | นายอัครพนธ์ โอมาโฮนี่    |
| POST | `/api/auth/logout`     | ออกจากระบบ                      | นายอัครพนธ์ โอมาโฮนี่    |
| GET  | `/api/auth/me`         | ข้อมูลผู้ใช้ปัจจุบัน            | นายอัครพนธ์ โอมาโฮนี่    |

### 2) นายไชยวัฒน์ ทำดี (Dashboard System / Read & Export)

- File: `app/routes/dashboard_routes.py`
- File: `app/routes/report_routes.py` (export/report)

| HTTP | URL                          | Description                           | Maintainer           |
|------|------------------------------|---------------------------------------|----------------------|
| GET  | `/api/dashboard/`          | สถิติหลัก (totalProjects, totalBudget, totalOrgs) | นายไชยวัฒน์ ทำดี    |
| GET  | `/api/dashboard/summary`    | สรุปตัวเลขบน Dashboard               | นายไชยวัฒน์ ทำดี    |
| GET  | `/api/dashboard/by-org`      | สรุปตามหน่วยงาน                      | นายไชยวัฒน์ ทำดี    |
| GET  | `/api/dashboard/by-sdg`     | สรุปตาม SDG Target                    | นายไชยวัฒน์ ทำดี    |
| GET  | `/api/projects/export`       | ส่งออกโครงการเป็น CSV (query: orgId?, year?) — Frontend มี modal เลือกโครงการและคอลัมน์ | นายไชยวัฒน์ ทำดี    |

### 3) นายกฤษฎาพงษ์ ทิณพัฒน์ (Project Management / Create & Delete)

- File: `app/routes/project_routes.py`

| HTTP | URL                                           | Description                      | Maintainer                    |
|------|-----------------------------------------------|----------------------------------|-------------------------------|
| GET  | `/api/projects/`                              | ดึงรายการโครงการ (list + filter)| นายกฤษฎาพงษ์ ทิณพัฒน์       |
| GET  | `/api/projects/all`                           | ดึงรายการโครงการทั้งหมด (ไม่ filter)| นายกฤษฎาพงษ์ ทิณพัฒน์       |
| GET  | `/api/projects/<project_id>`                  | รายละเอียดโครงการ               | นายกฤษฎาพงษ์ ทิณพัฒน์       |
| POST | `/api/projects/`                              | สร้างโครงการใหม่                | นายกฤษฎาพงษ์ ทิณพัฒน์       |
| PUT  | `/api/projects/<project_id>`                  | แก้ไขโครงการ                    | นายกฤษฎาพงษ์ ทิณพัฒน์       |
| DELETE | `/api/projects/<project_id>`                | ลบโครงการ                       | นายกฤษฎาพงษ์ ทิณพัฒน์       |
| POST | `/api/projects/<project_id>/images`           | อัปโหลดรูปโครงการ               | นายกฤษฎาพงษ์ ทิณพัฒน์       |
| DELETE | `/api/projects/<project_id>/images/<image_id>` | ลบรูปโครงการ                 | นายกฤษฎาพงษ์ ทิณพัฒน์       |

### 4) นายศิขรินทร์ ภูติโส (Organization Management / Admin & View)

- File: `app/routes/org_routes.py`

| HTTP | URL                                   | Description                                 | Maintainer              |
|------|---------------------------------------|---------------------------------------------|-------------------------|
| GET  | `/api/orgs/`                          | รายการหน่วยงาน (มุมมอง Admin)             | นายศิขรินทร์ ภูติโส    |
| GET  | `/api/orgs/public`                    | รายการหน่วยงานแบบ read-only (User)        | นายศิขรินทร์ ภูติโส    |
| POST | `/api/orgs/`                          | สร้างหน่วยงานใหม่                          | นายศิขรินทร์ ภูติโส    |
| PUT  | `/api/orgs/<org_id>`                  | แก้ไขข้อมูลหน่วยงาน                        | นายศิขรินทร์ ภูติโส    |
| DELETE | `/api/orgs/<org_id>`                | ลบหน่วยงาน (ต้องไม่มีโครงการ — กรุณาลบโครงการที่เกี่ยวข้องก่อน) | นายศิขรินทร์ ภูติโส    |

### 5) นายพิชชากร คำพรม (User & Role Management / Create & Update)

- File: `app/routes/user_routes.py`
- File: `app/routes/pin_routes.py` (ตั้งค่า PIN หน่วยงาน)

| HTTP | URL                                    | Description                                 | Maintainer             |
|------|----------------------------------------|---------------------------------------------|------------------------|
| GET  | `/api/users/`                          | รายการผู้ใช้ทั้งหมด                        | นายพิชชากร คำพรม     |
| POST | `/api/users/`                          | สร้างผู้ใช้ใหม่                            | นายพิชชากร คำพรม     |
| PUT  | `/api/users/<user_id>`                 | แก้ไขข้อมูลผู้ใช้/บทบาท                    | นายพิชชากร คำพรม     |
| PUT  | `/api/users/<user_id>/password`        | เปลี่ยนรหัสผ่านผู้ใช้                     | นายพิชชากร คำพรม     |
| PUT  | `/api/orgs/<org_id>/pin`               | ตั้งค่า PIN ของหน่วยงาน (Admin เท่านั้น)  | นายพิชชากร คำพรม     |

### 6) นายนัธทวัฒน์ เขาแก้ว (Audit Log / Read, Filter)

- File: `app/routes/audit_routes.py`

| HTTP | URL                          | Description                           | Maintainer              |
|------|------------------------------|---------------------------------------|-------------------------|
| GET  | `/api/audit/`               | ดึงรายการ audit log + filter         | นายนัธทวัฒน์ เขาแก้ว  |

---

### ปัญหาที่พบบ่อย (FAQ)

| ปัญหา | แนวทางแก้ไข |
|-------|-------------|
| ล็อกอินไม่ได้ | Admin: PIN แสดงใน banner ตอนรันเซิร์ฟเวอร์ (หรือกำหนด env `ADMIN_PIN`) — หน่วยงาน: Admin ดู PIN ได้จากหน้าจัดการหน่วยงาน |
| CORS Error ตอนเรียก API | ตรวจว่า Backend รันอยู่ที่ port 5000 และ CORS อนุญาต localhost |
| เปลี่ยนพอร์ต Backend | ระบบตรวจ `window.location.port === '5000'` อัตโนมัติ หากใช้พอร์ตอื่น ตั้ง `window.API_BASE` ก่อนโหลด |
| ฐานข้อมูล corrupt / อยากเริ่มใหม่ | ลบไฟล์ `backend/instance/sdg4.db` แล้วรัน Backend อีกครั้ง ระบบจะสร้างฐานข้อมูลและเติมข้อมูลเริ่มต้นใหม่ (Admin/หน่วยงานได้ PIN random ใหม่) |
| หน้าเว็บโหลดไม่ขึ้น | รัน `python run.py` ในโฟลเดอร์ backend แล้วเปิด `http://127.0.0.1:5000` — ไม่ต้องใช้ Node.js |

---

### อ้างอิง / บรรณานุกรม

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy — The Database Toolkit for Python](https://www.sqlalchemy.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Chart.js](https://www.chartjs.org/)
- [SweetAlert2](https://sweetalert2.github.io/)
- [Python 3 Documentation](https://docs.python.org/3/)

---

### งานต่อยอด (Future Work)

- ระบบแจ้งเตือน (LINE Notify / Email) เมื่อมีการอัปเดตโครงการ
- รองรับการอัปโหลดไฟล์เอกสารแนบโครงการ
- Dashboard สถิติและรายงานเชิงวิเคราะห์เพิ่มเติม
- Mobile-friendly / PWA สำหรับใช้งานบนมือถือ
- นำออก (Export) รูปแบบอื่น เช่น PDF, Excel

