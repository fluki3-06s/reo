"""
PIN Management Routes - จัดการ PIN ของหน่วยงาน

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการเกี่ยวกับการเปลี่ยนแปลง PIN ของหน่วยงาน
มี 1 endpoint:

1. PUT /api/orgs/<org_id>/pin - เปลี่ยน PIN ของหน่วยงาน

================================================================================
ความสัมพันธ์กับ User Model:
================================================================================
เมื่อเปลี่ยน PIN ของหน่วยงาน:
- Org.pin จะถูกอัปเดต
- Manager.password ของหน่วยงานนั้นก็จะถูกอัปเดตด้วย
(เพราะ Manager ใช้ PIN เดียวกันในการ login)

================================================================================
Authorization:
================================================================================
เฉพาะ Admin เท่านั้นที่สามารถเปลี่ยน PIN ได้
"""
from __future__ import annotations

import time
from datetime import datetime

from flask import Blueprint, jsonify, request

from app.database import db
from app.models import AuditLog, Org, User
from app.utils import get_current_username, require_admin

# สร้าง Blueprint สำหรับ pin routes
# หมายเหตุ: Blueprint นี้ลงทะเบียนที่ /api/orgs (เหมือน org_bp)
# แต่มี route /<org_id>/pin ที่ต้อง match ก่อน /<org_id> ปกติ
pin_bp = Blueprint("org_pins", __name__)


@pin_bp.route("/<org_id>/pin", methods=["PUT"])
def set_org_pin(org_id: str):
    """
    เปลี่ยน PIN ของหน่วยงาน (Admin only)
    
    Method: PUT
    URL: /api/orgs/<org_id>/pin
    Authorization: Admin เท่านั้น
    
    Request Body:
        {
            "pin": "123456"
        }
    
    Response (สำเร็จ):
        HTTP 200
        {
            "message": "บันทึก PIN สำเร็จ"
        }
    
    Response (ผิดพลาด):
        HTTP 400 - PIN ไม่ถูกรูปแบบ (ต้องเป็นตัวเลข 6 หลัก)
        HTTP 404 - ไม่พบหน่วยงาน
        HTTP 403 - ไม่ใช่ admin
    
    สิ่งที่เกิดขึ้นเมื่อเปลี่ยน PIN:
    1. ตรวจสอบว่า org_id มีอยู่จริง
    2. ตรวจสอบว่า PIN เป็นตัวเลข 6 หลัก
    3. อัปเดต Org.pin
    4. อัปเดต Manager.password (ถ้ามี Manager ของหน่วยงานนี้)
    5. บันทึก AuditLog
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err

    # ค้นหาหน่วยงาน
    org = Org.query.get(org_id)
    if not org:
        return jsonify(message="ไม่พบหน่วยงาน"), 404

    # รับข้อมูล PIN จาก request
    data = request.get_json(silent=True) or {}
    pin_raw = data.get("pin")
    pin = str(pin_raw).strip() if pin_raw is not None else ""

    # ตรวจสอบว่า PIN เป็นตัวเลข 6 หลัก
    if not pin or len(pin) != 6 or not pin.isdigit():
        return jsonify(message="PIN ต้องเป็นตัวเลข 6 หลัก"), 400

    # อัปเดต PIN ของหน่วยงาน
    org.pin = pin
    db.session.add(org)

    # อัปเดต PIN ของ Manager (ถ้ามี)
    # Manager ใช้ PIN เดียวกันกับหน่วยงาน
    mgr = User.query.filter_by(role="manager", org_id=org_id).first()
    if mgr:
        mgr.password = pin
        db.session.add(mgr)

    # สร้าง timestamp สำหรับ AuditLog
    ts_ms = int(time.time() * 1000)
    time_str = datetime.fromtimestamp(ts_ms / 1000.0).strftime("%d/%m/%Y %H:%M:%S")

    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=ts_ms,
        action="set_org_pin",
        by_username=get_current_username(),
        org_id=org_id,
        details=f"เปลี่ยน PIN หน่วยงาน เมื่อ {time_str}",
    ))

    # Commit ข้อมูล
    db.session.commit()
    return jsonify(message="บันทึก PIN สำเร็จ"), 200
