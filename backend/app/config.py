"""
Configuration - การตั้งค่าระบบ

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้กำหนดค่าตั้งต้น (Configuration) สำหรับระบบ Flask

================================================================================
Config Classes:
================================================================================
1. Config        - ค่าพื้นฐาน (ใช้ทั้ง Dev และ Prod)
2. DevConfig     - ค่าสำหรับ Development
3. ProdConfig    - ค่าสำหรับ Production

================================================================================
Environment Variables:
================================================================================
SECRET_KEY    - Key สำหรับ sign session/cookie
               ควรกำหนดเป็น random string ที่ยาวใน production
               
ADMIN_PIN     - PIN ผู้ดูแลระบบ (6 หลัก)
               ถ้าไม่กำหนดจะสุ่ม PIN ใหม่ตอน seed data
               
DATABASE_URL  - URI ของ database
               ถ้าไม่กำหนดจะใช้ SQLite ที่ backend/instance/sdg4.db

================================================================================
Database: SQLite
================================================================================
ระบบนี้ใช้ SQLite เป็น database เนื่องจาก:
- ไม่ต้องติดตั้ง database server แยก
- เหมาะสำหรับ development และระบบขนาดเล็ก-กลาง
- ข้อมูลเก็บในไฟล์: backend/instance/sdg4.db

================================================================================
"""
from __future__ import annotations

import os


class Config:
    """
    Configuration พื้นฐานสำหรับ development และ production
    
    Attributes:
        SECRET_KEY: Key สำหรับ sign session/cookie
        ADMIN_PIN: รหัส PIN ผู้ดูแลระบบ (กำหนดผ่าน env ADMIN_PIN ได้)
        SQLALCHEMY_DATABASE_URI: เส้นทางฐานข้อมูล SQLite
        SQLALCHEMY_TRACK_MODIFICATIONS: ปิดการ track changes (ประหยัด memory)
        JSON_AS_ASCII: รองรับ Unicode ใน JSON response
    """
    # SECRET_KEY ใช้สำหรับ sign session และ security tokens
    # ควรกำหนดเป็น random string ที่ยาวและซับซ้อนใน production
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
    
    # Admin PIN: รหัสผ่านสำหรับผู้ดูแลระบบ
    # สามารถกำหนดได้ 2 วิธี:
    # 1. ผ่าน environment variable ADMIN_PIN (แนะนำสำหรับ production)
    # 2. ถ้าไม่กำหนด จะสุ่ม PIN อัตโนมัติตอน seed data
    ADMIN_PIN = os.environ.get("ADMIN_PIN", "")

    # สร้างโฟลเดอร์ instance/ ถ้ายังไม่มี
    # โฟลเดอร์นี้ใช้เก็บไฟล์ที่ระบบสร้างขึ้น เช่น SQLite database
    _instance_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance")
    os.makedirs(_instance_path, exist_ok=True)
    
    # กำหนด path ของ SQLite database
    # อยู่ที่: backend/instance/sdg4.db
    # ใช้ replace("\\", "/") เพื่อให้ path ถูกต้องทั้ง Windows และ Linux
    _db_path = os.path.join(_instance_path, "sdg4.db").replace("\\", "/")
    
    # SQLAlchemy Database URI
    # รูปแบบ: sqlite:///path/to/database.db
    # สามารถ override ได้ด้วย DATABASE_URL environment variable
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", f"sqlite:///{_db_path}")
    
    # ปิดการ track modifications ของ SQLAlchemy
    # ช่วยประหยัด memory และ CPU เพราะเราไม่ได้ใช้ feature นี้
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # รองรับ Unicode (ภาษาไทย, ภาษาอื่นๆ) ใน JSON response
    # ถ้าเป็น True ภาษาไทยจะกลายเป็น Unicode escape sequences
    JSON_AS_ASCII = False


class DevConfig(Config):
    """
    Configuration สำหรับ Development
    
    ใช้เมื่อ FLASK_ENV=development หรือไม่ได้ตั้งค่า
    """
    DEBUG = True


class ProdConfig(Config):
    """
    Configuration สำหรับ Production
    
    ใช้เมื่อ FLASK_ENV=production
    """
    DEBUG = False
