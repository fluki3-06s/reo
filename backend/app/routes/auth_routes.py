"""
Authentication Routes - จัดการการเข้าสู่ระบบ (Login/Logout)

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการเกี่ยวกับ authentication (การยืนยันตัวตน) ของระบบ
โดยมี 3 endpoints:

1. POST /api/auth/login    - เข้าสู่ระบบ
2. POST /api/auth/logout   - ออกจากระบบ
3. GET  /api/auth/me       - ดึงข้อมูลผู้ใช้ปัจจุบัน

================================================================================
ระบบ Authentication:
================================================================================
ระบบนี้ใช้รูปแบบ "Username + PIN" สำหรับ login:

- Admin Login:
  - orgId = "admin"
  - PIN = รหัสผู้ดูแลระบบ (กำหนดใน config หรือ seed)
  - สิทธิ์: เห็น/จัดการได้ทุกอย่าง

- Manager Login:
  - orgId = รหัสหน่วยงาน เช่น "org-001"
  - PIN = รหัส PIN ของหน่วยงานนั้น
  - สิทธิ์: เห็นโครงการทุกหน่วยงาน, แก้ไขได้เฉพาะของหน่วยงานตัวเอง

================================================================================
Session Management:
================================================================================
เมื่อ login สำเร็จจะเก็บข้อมูลใน Flask session:
- session["user_id"]  - รหัสผู้ใช้
- session["role"]     - บทบาท ("admin" หรือ "manager")
- session["org_id"]   - รหัสหน่วยงาน (None สำหรับ admin)

Session ถูกจัดการผ่าน cookie ฝั่ง server (อย่างปลอดภัย)
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request, session

from app.database import db
from app.models import Org, User
from app.utils import get_current_user

# สร้าง Blueprint สำหรับ auth routes
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Endpoint สำหรับเข้าสู่ระบบ
    
    Method: POST
    URL: /api/auth/login
    Content-Type: application/json
    
    Request Body:
        {
            "orgId": "admin" หรือ "org-001",
            "pin": "123456"
        }
    
    Response (สำเร็จ):
        HTTP 200
        {
            "session": {
                "role": "admin" หรือ "manager",
                "userId": "u-admin" หรือ "u-mgr-org-001",
                "orgId": null หรือ "org-001"
            },
            "message": "เข้าสู่ระบบสำเร็จ"
        }
    
    Response (ผิดพลาด):
        HTTP 400 - PIN ไม่ถูกรูปแบบ (ไม่ใช่ตัวเลข 6 หลัก)
        HTTP 401 - PIN ผิด หรือหน่วยงานถูกปิดใช้งาน
    
    ขั้นตอนการทำงาน:
    1. รับข้อมูล orgId และ pin จาก request
    2. ตรวจสอบว่า PIN เป็นตัวเลข 6 หลัก
    3. ถ้า orgId = "admin" → ตรวจสอบกับ admin account
    4. ถ้า orgId เป็นหน่วยงาน → ตรวจสอบกับ org + manager
    5. ถ้าผ่าน → สร้าง session และส่ง response
    """
    # รับ JSON data จาก request body
    data = request.get_json(silent=True) or {}
    
    # รองรับทั้ง orgId และ org_id (legacy support)
    org_id = data.get("orgId") or data.get("org_id")
    pin_raw = data.get("pin")
    
    # จัดการ PIN: แปลงเป็น string และตัดช่องว่าง
    pin = str(pin_raw).strip() if pin_raw is not None else ""

    # ตรวจสอบว่า PIN เป็นตัวเลข 6 หลัก
    # regex: ^\d{6}$ หมายถึงตัวเลข 6 ตัวพอดี
    if not pin or len(pin) != 6 or not pin.isdigit():
        return jsonify(message="PIN ต้องเป็นตัวเลข 6 หลัก"), 400

    # ===== Admin Login =====
    if org_id == "admin":
        # ค้นหา admin account ที่ active
        user = User.query.filter_by(role="admin", active=True).first()
        
        # ตรวจสอบว่า PIN ตรงกัน
        if not user or pin != user.password:
            return jsonify(message="รหัส PIN ของผู้ดูแลระบบไม่ถูกต้อง"), 401
        
        # สร้าง session สำหรับ admin
        session["user_id"] = user.id
        session["role"] = "admin"
        session["org_id"] = None
        
        return jsonify(
            session={
                "role": "admin",
                "userId": user.id,
                "orgId": None,
            },
            message="เข้าสู่ระบบสำเร็จ",
        ), 200

    # ===== Manager Login =====
    # ค้นหาหน่วยงาน
    org = Org.query.filter_by(id=org_id, active=True).first()
    
    # ถ้าหน่วยงานไม่มีหรือถูกปิดใช้งาน
    if not org:
        return jsonify(message="หน่วยงานถูกปิดใช้งาน"), 401

    # ค้นหา manager ของหน่วยงานนี้
    user = User.query.filter_by(role="manager", org_id=org_id, active=True).first()
    
    # ตรวจสอบ PIN
    # Manager ใช้ PIN ของหน่วยงาน หรือ PIN ของตัวเอง (ก็ได้ทั้งคู่)
    if not user or pin != (org.pin or user.password):
        return jsonify(message="PIN ไม่ถูกต้อง"), 401

    # สร้าง session สำหรับ manager
    session["user_id"] = user.id
    session["role"] = "manager"
    session["org_id"] = org_id

    return jsonify(
        session={
            "role": "manager",
            "userId": user.id,
            "orgId": org_id,
        },
        message="เข้าสู่ระบบสำเร็จ",
    ), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Endpoint สำหรับออกจากระบบ
    
    Method: POST
    URL: /api/auth/logout
    
    ทำการล้าง session ทั้งหมด
    (session.clear() จะลบข้อมูลทั้งหมดใน session)
    
    Response:
        HTTP 200
        {
            "message": "ออกจากระบบแล้ว"
        }
    """
    session.clear()
    return jsonify(message="ออกจากระบบแล้ว"), 200


@auth_bp.route("/me", methods=["GET"])
def current_user():
    """
    Endpoint สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน
    
    Method: GET
    URL: /api/auth/me
    
    ใช้เพื่อตรวจสอบว่าผู้ใช้ login อยู่หรือไม่
    (ส่วนใหญ่ใช้ในการ restore session หลัง refresh หน้า)
    
    Response (ถ้ายังไม่ login):
        HTTP 200
        {
            "user": null
        }
    
    Response (ถ้า login แล้ว):
        HTTP 200
        {
            "user": {
                "id": "u-admin",
                "username": "admin",
                "role": "admin",
                "orgId": null,
                "orgName": null
            },
            "session": {
                "role": "admin",
                "userId": "u-admin",
                "orgId": null
            }
        }
    """
    # ดึงข้อมูล user ปัจจุบันจาก session
    user = get_current_user()
    
    # ถ้ายังไม่ได้ login
    if not user:
        return jsonify(user=None), 200
    
    # ดึงชื่อหน่วยงาน (ถ้ามี)
    org_name = None
    if user.org_id:
        org = Org.query.get(user.org_id)
        org_name = org.name if org else None
    
    return jsonify(
        user={
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "orgId": user.org_id,
            "orgName": org_name,
        },
        session={
            "role": session.get("role"),
            "userId": user.id,
            "orgId": session.get("org_id"),
        },
    ), 200


@auth_bp.route("/admin-pin", methods=["GET"])
def get_admin_pin():
    """
    Endpoint สำหรับดึง Admin PIN (สำหรับระบบ Demo)
    
    Method: GET
    URL: /api/auth/admin-pin
    
    ใช้เพื่อแสดง Admin PIN ในหน้า login (ระบบ Demo)
    
    Response:
        HTTP 200
        {
            "adminPin": "123456"
        }
    """
    # ค้นหา admin account
    user = User.query.filter_by(role="admin", active=True).first()
    
    if user:
        return jsonify(adminPin=user.password), 200
    return jsonify(adminPin=None), 200
