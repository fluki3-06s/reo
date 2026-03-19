"""
Models - โครงสร้างตารางในฐานข้อมูล (Database Schema)

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้กำหนดโครงสร้างข้อมูล (Schema) ทั้งหมดในระบบ
โดยใช้ SQLAlchemy ORM (Object-Relational Mapping)

ORM ทำให้เราสามารถทำงานกับ database โดยใช้ Python classes และ objects
แทนที่จะต้องเขียน SQL queries โดยตรง

================================================================================
Tables (ตาราง):
================================================================================
1. Org       - หน่วยงาน
2. User      - ผู้ใช้ระบบ (Admin/Manager)
3. Project   - โครงการ
4. ProjectImage - รูปภาพโครงการ
5. AuditLog  - ประวัติการทำงาน

================================================================================
Relationships:
================================================================================
Org (1) ────── (N) User
Org (1) ────── (N) Project
Project (1) ── (N) ProjectImage

ผังความสัมพันธ์:
┌─────────┐         ┌─────────────┐
│   Org   │1───────N│    User     │
└─────────┘         └─────────────┘
     │
     │ 1:N
     ▼
┌─────────────┐      ┌─────────────────┐
│  Project    │1─────N│  ProjectImage   │
└─────────────┘      └─────────────────┘
"""
from __future__ import annotations

from datetime import datetime

from .database import db


class Org(db.Model):
    """
    หน่วยงาน (Organization)
    
    ตารางนี้เก็บข้อมูลหน่วยงานที่เข้าร่วมโครงการ SDG 4
    เช่น โรงเรียน, สำนักงานศึกษาธิการ, มหาวิทยาลัย ฯลฯ
    
    Attributes:
        id        - รหัสหน่วยงาน (Primary Key) เช่น "org-001"
        name      - ชื่อหน่วยงาน
        active    - สถานะการใช้งาน (True=เปิด, False=ปิด)
        pin       - รหัส PIN สำหรับ login (6 หลัก)
    
    Relationships:
        users     - ผู้ใช้ที่สังกัดหน่วยงานนี้ (1:N)
        projects  - โครงการของหน่วยงานนี้ (1:N)
    """
    # กำหนดชื่อตารางใน database
    __tablename__ = "orgs"

    # Primary Key - รหัสหน่วยงาน (ต้อง unique)
    # เช่น "org-001", "org-023" (ใช้ UUID prefix)
    id = db.Column(db.String(64), primary_key=True)
    
    # ชื่อหน่วยงาน (required, ไม่ว่างเปล่า)
    # เช่น "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน"
    name = db.Column(db.String(500), nullable=False)
    
    # สถานะการใช้งาน
    # True  = หน่วยงานเปิดใช้งานอยู่ (manager สามารถ login ได้)
    # False = หน่วยงานถูกปิดใช้งาน (manager login ไม่ได้)
    active = db.Column(db.Boolean, default=True, nullable=False)
    
    # รหัส PIN สำหรับ login
    # ผู้จัดการหน่วยงาน (Manager) ใช้ PIN นี้ในการเข้าสู่ระบบ
    # ค่าเริ่มต้น: "123456" (ถูกเปลี่ยนตอน seed)
    pin = db.Column(db.String(6), nullable=False, default="123456")

    # Relationship: ผู้ใช้ที่สังกัดหน่วยงานนี้
    # back_populates="org" หมายถึงไปหา Org ใน User model
    users = db.relationship("User", back_populates="org", foreign_keys="User.org_id")
    
    # Relationship: โครงการของหน่วยงานนี้
    # ใช้สำหรับนับจำนวนโครงการ หรือแสดงโครงการทั้งหมดของหน่วยงาน
    projects = db.relationship("Project", back_populates="org")


class User(db.Model):
    """
    ผู้ใช้ระบบ (User)
    
    ตารางนี้เก็บข้อมูลผู้ใช้ที่สามารถเข้าใช้งานระบบ
    แบ่งเป็น 2 ประเภท:
    1. Admin   - ผู้ดูแลระบบ (มีสิทธิ์ทำทุกอย่าง)
    2. Manager - ผู้จัดการหน่วยงาน (จัดการโครงการของหน่วยงานตัวเองเท่านั้น)
    
    Attributes:
        id       - รหัสผู้ใช้ (Primary Key)
        username - ชื่อผู้ใช้สำหรับ login
        password - รหัสผ่าน/PIN (ในระบบนี้ใช้ PIN 6 หลัก)
        role     - บทบาท ("admin" หรือ "manager")
        org_id   - หน่วยงานที่สังกัด (เฉพาะ manager)
        active   - สถานะการใช้งาน
    
    Note:
        - Admin มีเพียง 1 คน และ org_id = None
        - Manager มี 1 คนต่อ 1 หน่วยงาน
    """
    __tablename__ = "users"

    # Primary Key - รหัสผู้ใช้
    id = db.Column(db.String(64), primary_key=True)
    
    # ชื่อผู้ใช้ (ต้อง unique ในระบบ)
    # Admin: "admin"
    # Manager: "mgr-org-001", "mgr-org-002" ฯลฯ
    username = db.Column(db.String(64), unique=True, nullable=False)
    
    # รหัสผ่าน (ในระบบนี้ใช้ PIN 6 หลัก)
    # สำหรับ Admin: ใช้ ADMIN_PIN (กำหนดใน config หรือ seed)
    # สำหรับ Manager: ใช้ PIN เดียวกับ Org.pin (ตอน seed จะตรงกัน)
    password = db.Column(db.String(64), nullable=False)
    
    # บทบาทในระบบ
    # "admin"   - ผู้ดูแลระบบ (เห็นทุกอย่าง, ทำทุกอย่าง)
    # "manager" - ผู้จัดการหน่วยงาน (เห็นโครงการทุกหน่วยงาน, แก้ไขได้เฉพาะของตัวเอง)
    role = db.Column(db.String(32), nullable=False)
    
    # Foreign Key - อ้างอิงไปยังตาราง orgs
    # เป็น NULL สำหรับ Admin (admin ไม่สังกัดหน่วยงานใด)
    # สำหรับ Manager จะชี้ไปยังหน่วยงานที่ตัวเองดูแล
    org_id = db.Column(db.String(64), db.ForeignKey("orgs.id"), nullable=True)
    
    # สถานะการใช้งาน
    # ถ้า False, ผู้ใช้ไม่สามารถ login ได้
    active = db.Column(db.Boolean, default=True, nullable=False)

    # Relationship: หน่วยงานที่ผู้ใช้สังกัด
    # foreign_keys=[org_id] ระบุว่าใช้ org_id field ในการ join
    org = db.relationship("Org", back_populates="users", foreign_keys=[org_id])


class Project(db.Model):
    """
    โครงการ (Project)
    
    ตารางนี้เก็บข้อมูลโครงการตามเป้าหมาย SDG 4
    แต่ละโครงการจะสังกัด 1 หน่วยงาน และมีรูปภาพประกอบ 1-4 รูป
    
    Attributes:
        id          - รหัสโครงการ (Primary Key)
        org_id      - หน่วยงานที่รับผิดชอบ
        title       - ชื่อโครงการ
        budget      - งบประมาณ (บาท)
        objective    - วัตถุประสงค์ของโครงการ
        policy      - นโยบาย/ข้อเสนอแนะเชิงนโยบาย
        owner       - ผู้รับผิดชอบโครงการ
        year        - ปีงบประมาณ (พ.ศ.)
        start_date  - วันเริ่มโครงการ
        end_date    - วันสิ้นสุดโครงการ
        sdg         - รายการ SDG targets ที่เกี่ยวข้อง (JSON array)
        created_at  - วันที่สร้างโครงการ
        updated_at  - วันที่แก้ไขโครงการล่าสุด
        updated_by  - ผู้ที่แก้ไขโครงการล่าสุด
    
    Validation:
        - title ห้ามว่าง
        - budget ต้อง >= 0
        - start_date ต้อง <= end_date
        - sdg ต้องมีอย่างน้อย 1 target
        - images ต้องมี 3-4 รูป
    """
    __tablename__ = "projects"

    # Primary Key - รหัสโครงการ
    # สร้างจาก UUID เช่น "p-a1b2c3d4e5f6"
    id = db.Column(db.String(64), primary_key=True)
    
    # Foreign Key - อ้างอิงไปยังหน่วยงานที่รับผิดชอบ
    org_id = db.Column(db.String(64), db.ForeignKey("orgs.id"), nullable=False)
    
    # ชื่อโครงการ (required)
    title = db.Column(db.String(500), nullable=False)
    
    # งบประมาณ (optional, อาจเป็น NULL)
    # เก็บเป็น float เพื่อรองรับทศนิยม
    budget = db.Column(db.Float, nullable=True)
    
    # วัตถุประสงค์ (optional)
    objective = db.Column(db.Text, nullable=True)
    
    # นโยบาย/ข้อเสนอแนะเชิงนโยบาย (optional)
    policy = db.Column(db.Text, nullable=True)
    
    # ผู้รับผิดชอบโครงการ (optional)
    owner = db.Column(db.String(255), nullable=True)
    
    # ปีงบประมาณ (พ.ศ.) เช่น 2569
    # validation: ต้องอยู่ระหว่าง 2400-2600
    year = db.Column(db.Integer, nullable=True)
    
    # วันเริ่มโครงการ (optional)
    # เก็บเป็น Python date object (ไม่ใช่ string)
    start_date = db.Column(db.Date, nullable=True)
    
    # วันสิ้นสุดโครงการ (optional)
    end_date = db.Column(db.Date, nullable=True)
    
    # SDG Targets ที่เกี่ยวข้อง
    # เก็บเป็น JSON array เช่น ["4.1", "4.2", "4.c"]
    # รองรับการเก็บ array ของ strings โดยไม่ต้อง serialize เอง
    sdg = db.Column(db.JSON, nullable=True)
    
    # วันที่สร้างโครงการ
    # default=datetime.utcnow คือถ้าไม่ระบุ จะใช้เวลาปัจจุบัน (UTC)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # วันที่แก้ไขล่าสุด
    # onupdate=datetime.utcnow คือถ้ามีการ update จะอัปเดตเป็นเวลาปัจจุบัน
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # ผู้แก้ไขล่าสุด (username)
    # ใช้สำหรับแสดงใน audit log และ UI
    updated_by = db.Column(db.String(64), nullable=True)

    # Relationship: หน่วยงานที่รับผิดชอบ
    org = db.relationship("Org", back_populates="projects")
    
    # Relationship: รูปภาพประกอบโครงการ
    # cascade="all, delete-orphan" หมายถึง:
    # - ถูก project ถูกลบ → รูปภาพทั้งหมดถูกลบด้วย (cascade)
    # - ถ้ารูปไม่มี project แม่แล้วจะถูกลบด้วย (orphan)
    images = db.relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan")


class ProjectImage(db.Model):
    """
    รูปภาพประกอบโครงการ (Project Image)
    
    ตารางนี้เก็บข้อมูลรูปภาพที่แนบกับโครงการ
    รูปภาพถูกเก็บในรูปแบบ base64 data URL (ไม่ได้เก็บเป็นไฟล์จริง)
    
    Attributes:
        id        - รหัสรูปภาพ (Primary Key)
        project_id - โครงการที่รูปนี้สังกัด (Foreign Key)
        name      - ชื่อไฟล์เดิม เช่น "activity1.jpg"
        data_url  - ข้อมูลรูปภาพในรูปแบบ base64 data URL
                   เช่น "data:image/jpeg;base64,/9j/4AAQ..."
        created_at - วันที่อัปโหลด
    
    Note:
        - แต่ละโครงการมีได้ 1-4 รูป
        - รูปถูกเก็บเป็น base64 string (inline) ไม่ใช่ไฟล์ภายนอก
        - ทำให้ deployment ง่าย แต่ database จะใหญ่ขึ้น
    """
    __tablename__ = "project_images"

    # Primary Key - รหัสรูปภาพ
    id = db.Column(db.String(64), primary_key=True)
    
    # Foreign Key - อ้างอิงไปยังโครงการ
    # ondelete="CASCADE" หมายถึงถ้า project ถูกลบ → รูปนี้ถูกลบด้วย
    project_id = db.Column(db.String(64), db.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    
    # ชื่อไฟล์เดิม (optional)
    # เช่น "IMG_1234.jpg", "รูปกิจกรรม 1.png"
    name = db.Column(db.String(255), nullable=True)
    
    # ข้อมูลรูปภาพในรูปแบบ base64 data URL
    # ตัวอย่าง: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    # สามารถแสดงรูปได้โดยตรงใน <img src="...">
    data_url = db.Column(db.Text, nullable=False)
    
    # วันที่อัปโหลดรูป
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationship: โครงการที่รูปนี้สังกัด
    project = db.relationship("Project", back_populates="images")


class AuditLog(db.Model):
    """
    ประวัติการทำงาน (Audit Log)
    
    ตารางนี้เก็บประวัติการทำงานทั้งหมดในระบบ
    ใช้สำหรับติดตามว่าใครทำอะไร เมื่อไหร่
    
    Attributes:
        id            - รหัส log (Primary Key, Auto increment)
        at            - timestamp ณ เวลาที่ทำการ (milliseconds จาก epoch)
        action        - ประเภทการกระทำ
        by_username   - ผู้ทำการ (username)
        project_id    - ID ของโครงการที่เกี่ยวข้อง (ถ้ามี)
        project_title - ชื่อโครงการที่เกี่ยวข้อง (ถ้ามี)
        org_id        - ID ของหน่วยงานที่เกี่ยวข้อง (ถ้ามี)
        details       - รายละเอียดเพิ่มเติม
    
    Actions ที่ถูกบันทึก:
        - create_project  - สร้างโครงการใหม่
        - update_project  - แก้ไขโครงการ
        - delete_project  - ลบโครงการ
        - create_org     - สร้างหน่วยงานใหม่
        - update_org     - แก้ไขหน่วยงาน
        - delete_org     - ลบหน่วยงาน
        - set_org_pin    - เปลี่ยน PIN หน่วยงาน
        - upload_image   - อัปโหลดรูป
        - delete_image   - ลบรูป
    
    Note:
        - ใช้ timestamp แบบ milliseconds (JavaScript style)
        - ไม่มี auto-delete - log ถูกเก็บไปตลอด
        - เฉพาะ admin เท่านั้นที่เห็น audit logs
    """
    __tablename__ = "audit_logs"

    # Primary Key - รหัส log
    # autoincrement=True คือ id จะเพิ่มอัตโนมัติทุกครั้ง
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    # Timestamp ณ เวลาที่ทำการ (milliseconds จาก epoch)
    # เช่น 1679650123456 = March 24, 2023 10:08:43.456 UTC
    # ใช้ BigInteger เพื่อรองรับค่าที่มาก (timestamp มากกว่า 2^31)
    at = db.Column(db.BigInteger, nullable=False)
    
    # ประเภทการกระทำ
    # เช่น "create_project", "update_org", "delete_project"
    action = db.Column(db.String(64), nullable=False)
    
    # ผู้ทำการ (username)
    # เช่น "admin", "mgr-org-001"
    by_username = db.Column(db.String(64), nullable=True)
    
    # ID ของโครงการที่เกี่ยวข้อง (ถ้ามี)
    project_id = db.Column(db.String(64), nullable=True)
    
    # ชื่อโครงการที่เกี่ยวข้อง (ถ้ามี)
    # เก็บไว้เผื่อโครงการถูกลบ แต่ยังอยากรู้ว่าชื่ออะไร
    project_title = db.Column(db.String(500), nullable=True)
    
    # ID ของหน่วยงานที่เกี่ยวข้อง (ถ้ามี)
    org_id = db.Column(db.String(64), nullable=True)
    
    # รายละเอียดเพิ่มเติม
    # เช่น "สร้างโครงการใหม่: โครงการพัฒนาทักษะดิจิทัล"
    details = db.Column(db.Text, nullable=True)
