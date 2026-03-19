"""
Organization Routes - จัดการหน่วยงาน (CRUD Operations)

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการเกี่ยวกับการ CRUD (Create, Read, Update, Delete) หน่วยงาน
ในระบบ มี 4 endpoints:

1. GET  /api/orgs/        - ดึงรายชื่อหน่วยงานทั้งหมด (Admin only)
2. GET  /api/orgs/public  - ดึงรายชื่อหน่วยงานแบบสาธารณะ (ไม่รวม PIN)
3. POST /api/orgs/        - สร้างหน่วยงานใหม่ (Admin only)
4. PUT  /api/orgs/<id>    - แก้ไขข้อมูลหน่วยงาน (Admin only)
5. DELETE /api/orgs/<id>  - ลบหน่วยงาน (Admin only)

================================================================================
ความสัมพันธ์:
================================================================================
- หน่วยงานมี Manager 1 คนต่อ 1 หน่วยงาน
- หน่วยงานมีโครงการได้หลายโครงการ
- เมื่อลบหน่วยงาน: Manager ของหน่วยงานนั้นจะถูกลบด้วย (Cascade)
- เมื่อปิด/เปิดหน่วยงาน: Manager ของหน่วยงานนั้นจะถูกปิด/เปิดด้วย
- ถ้าหน่วยงานมีโครงการอยู่ จะลบหน่วยงานไม่ได้

================================================================================
Authorization:
================================================================================
- GET /public: ทุกคนเข้าถึงได้ (รวมถึงคนที่ยังไม่ได้ login)
- ที่เหลือ: เฉพาะ Admin เท่านั้น
"""
from __future__ import annotations

import time

from flask import Blueprint, jsonify, request

from app.database import db
from app.models import AuditLog, Org, Project, User
from app.utils import generate_unique_org_pin, get_current_username, require_admin

# สร้าง Blueprint สำหรับ org routes
org_bp = Blueprint("orgs", __name__)


def _org_to_json(org: Org) -> dict:
    """
    แปลง Org object เป็น dictionary สำหรับ JSON response
    
    Args:
        org: Org object ที่ต้องการแปลง
        
    Returns:
        dict ที่มีฟิลด์: id, name, active, pin, projectCount
    """
    # นับจำนวนโครงการของหน่วยงานนี้
    project_count = Project.query.filter_by(org_id=org.id).count()
    
    return {
        "id": org.id,
        "name": org.name,
        "active": org.active,
        "pin": org.pin,
        "projectCount": project_count,
    }


@org_bp.route("/", methods=["GET"])
def list_orgs():
    """
    ดึงรายชื่อหน่วยงานทั้งหมด (Admin only)
    
    Method: GET
    URL: /api/orgs/
    Authorization: Admin เท่านั้น
    
    Response:
        HTTP 200
        {
            "items": [
                {
                    "id": "org-001",
                    "name": "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
                    "active": true,
                    "pin": "123456",
                    "projectCount": 5
                },
                ...
            ]
        }
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err
    
    # ดึงหน่วยงานทั้งหมด เรียงตามชื่อ (A-Z)
    orgs = Org.query.order_by(Org.name).all()
    
    # แปลงเป็น JSON และส่งกลับ
    return jsonify(items=[_org_to_json(o) for o in orgs]), 200


@org_bp.route("/public", methods=["GET"])
def list_orgs_public():
    """
    ดึงรายชื่อหน่วยงานแบบสาธารณะ (ไม่รวม PIN)
    
    Method: GET
    URL: /api/orgs/public
    Authorization: ทุกคน (รวมถึงคนที่ยังไม่ได้ login)
    
    ใช้สำหรับ:
    - หน้า login (แสดงรายชื่อหน่วยงานให้เลือก)
    - Manager view (ดูรายชื่อหน่วยงานอื่นๆ)
    
    Response:
        HTTP 200
        {
            "items": [
                {
                    "id": "org-001",
                    "name": "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
                    "active": true,
                    "projectCount": 5
                },
                ...
            ]
        }
    """
    # ดึงเฉพาะหน่วยงานที่ active เรียงตามชื่อ
    orgs = Org.query.filter_by(active=True).order_by(Org.name).all()
    
    items = []
    for o in orgs:
        # นับจำนวนโครงการ
        project_count = Project.query.filter_by(org_id=o.id).count()
        items.append({
            "id": o.id,
            "name": o.name,
            "active": o.active,
            "projectCount": project_count,
        })
    
    return jsonify(items=items), 200


@org_bp.route("/", methods=["POST"])
def create_org():
    """
    สร้างหน่วยงานใหม่ (Admin only)
    
    Method: POST
    URL: /api/orgs/
    Authorization: Admin เท่านั้น
    
    Request Body:
        {
            "name": "หน่วยงานใหม่"
        }
    
    Response (สำเร็จ):
        HTTP 201
        {
            "item": {...},
            "message": "เพิ่มหน่วยงานสำเร็จ"
        }
    
    Response (ผิดพลาด):
        HTTP 400 - ชื่อหน่วยงานว่างเปล่า
        HTTP 403 - ไม่ใช่ admin
    
    สิ่งที่เกิดขึ้นเมื่อสร้าง:
    1. สร้าง Org ใหม่พร้อม PIN สุ่ม
    2. สร้าง Manager account สำหรับหน่วยงานนี้
    3. บันทึก AuditLog
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err

    # รับข้อมูลจาก request
    data = request.get_json(silent=True) or {}
    name_raw = data.get("name")
    name = str(name_raw).strip() if name_raw is not None else ""
    
    # ตรวจสอบว่าชื่อไม่ว่างเปล่า
    if not name:
        return jsonify(message="กรุณาระบุชื่อหน่วยงาน"), 400

    # สร้าง ID ใหม่ (ใช้ UUID)
    import uuid
    org_id = "org-" + uuid.uuid4().hex[:8]
    
    # สร้าง PIN สำหรับหน่วยงาน (ไม่ซ้ำกับที่มี)
    pin = generate_unique_org_pin()
    
    # สร้าง Org object
    org = Org(id=org_id, name=name, active=True, pin=pin)
    db.session.add(org)

    # สร้าง Manager account สำหรับหน่วยงานนี้
    # Manager จะใช้ PIN เดียวกับ Org ในการ login
    mgr = User(
        id=f"u-mgr-{org_id}",
        username=f"mgr-{org_id}",
        password=pin,  # PIN ตรงกับ Org
        role="manager",
        org_id=org_id,
        active=True,
    )
    db.session.add(mgr)

    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=int(time.time() * 1000),  # timestamp เป็น milliseconds
        action="create_org",
        by_username=get_current_username(),
        org_id=org_id,
        details=f"สร้างหน่วยงาน: {name}",
    ))
    
    # Commit ข้อมูล
    db.session.commit()

    return jsonify(item=_org_to_json(org), message="เพิ่มหน่วยงานสำเร็จ"), 201


@org_bp.route("/<org_id>", methods=["PUT"])
def update_org(org_id: str):
    """
    แก้ไขข้อมูลหน่วยงาน (Admin only)
    
    Method: PUT
    URL: /api/orgs/<org_id>
    Authorization: Admin เท่านั้น
    
    Request Body:
        {
            "name": "ชื่อใหม่",      // optional
            "active": false           // optional (ปิด/เปิดใช้งาน)
        }
    
    Response (สำเร็จ):
        HTTP 200
        {
            "item": {...},
            "message": "อัปเดตสำเร็จ"
        }
    
    Response (ผิดพลาด):
        HTTP 404 - ไม่พบหน่วยงาน
        HTTP 403 - ไม่ใช่ admin
    
    สิ่งที่เกิดขึ้นเมื่อแก้ไข:
    1. ถ้าเปลี่ยนชื่อ → บันทึกชื่อใหม่
    2. ถ้าเปลี่ยน active → บันทึกสถานะใหม่
    3. ถ้า active เปลี่ยน → Manager ของหน่วยงานก็จะถูกปิด/เปิดด้วย
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err

    # ค้นหาหน่วยงาน
    org = Org.query.get(org_id)
    if not org:
        return jsonify(message="ไม่พบหน่วยงาน"), 404

    # รับข้อมูลจาก request
    data = request.get_json(silent=True) or {}
    name_raw = data.get("name")
    name = str(name_raw).strip() if name_raw is not None else ""
    
    # เก็บรายการการเปลี่ยนแปลง (สำหรับ AuditLog)
    changes = []
    
    # ถ้ามีการเปลี่ยนสถานะ active
    if "active" in data:
        new_active = bool(data["active"])
        if new_active != org.active:
            org.active = new_active
            
            # อัปเดต active ของ Manager ของหน่วยงานนี้ด้วย
            # เพื่อให้สอดคล้องกัน (ถ้าปิดหน่วยงาน → Manager login ไม่ได้)
            mgr = User.query.filter_by(role="manager", org_id=org_id).first()
            if mgr:
                mgr.active = new_active
            
            # บันทึก AuditLog แยกตามการเปิด/ปิด
            action_type = "enable_org" if new_active else "disable_org"
            status_text = "เปิดใช้งาน" if new_active else "ปิดใช้งาน"
            db.session.add(AuditLog(
                at=int(time.time() * 1000),
                action=action_type,
                by_username=get_current_username(),
                org_id=org_id,
                details=f"เปลี่ยนสถานะหน่วยงาน: {status_text}",
            ))
    
    # ถ้ามีการเปลี่ยนชื่อ → บันทึก AuditLog แยก
    if name and name != org.name:
        old_name = org.name
        org.name = name
        db.session.add(AuditLog(
            at=int(time.time() * 1000),
            action="update_org",
            by_username=get_current_username(),
            org_id=org_id,
            details=f"เปลี่ยนชื่อ: '{old_name}' -> '{name}'",
        ))
    
    # Commit ข้อมูล
    db.session.commit()
    return jsonify(item=_org_to_json(org), message="อัปเดตสำเร็จ"), 200


@org_bp.route("/<org_id>", methods=["DELETE"])
def delete_org(org_id: str):
    """
    ลบหน่วยงาน (Admin only)
    
    Method: DELETE
    URL: /api/orgs/<org_id>
    Authorization: Admin เท่านั้น
    
    Response (สำเร็จ):
        HTTP 200
        {
            "message": "ลบหน่วยงานสำเร็จ"
        }
    
    Response (ผิดพลาด):
        HTTP 400 - หน่วยงานมีโครงการอยู่ (ต้องลบโครงการก่อน)
        HTTP 404 - ไม่พบหน่วยงาน
        HTTP 403 - ไม่ใช่ admin
    
    สิ่งที่เกิดขึ้นเมื่อลบ:
    1. ตรวจสอบว่าหน่วยงานมีโครงการหรือไม่
    2. ถ้ามี → return error (ไม่อนุญาตให้ลบ)
    3. ถ้าไม่มี → ลบ Manager ของหน่วยงาน
    4. บันทึก AuditLog
    5. ลบหน่วยงาน
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err

    # ค้นหาหน่วยงาน
    org = Org.query.get(org_id)
    if not org:
        return jsonify(message="ไม่พบหน่วยงาน"), 404

    # ตรวจสอบว่าหน่วยงานมีโครงการหรือไม่
    project_count = Project.query.filter_by(org_id=org_id).count()

    # ถ้ามีโครงการ → ไม่อนุญาตให้ลบ
    # (ต้องลบโครงการก่อน เพื่อความปลอดภัย)
    if project_count > 0:
        return jsonify(
            message="ไม่สามารถลบได้ กรุณาลบโครงการที่เกี่ยวข้องก่อน",
            projectCount=project_count,
        ), 400

    # ลบ Manager ของหน่วยงานนี้
    # DELETE FROM users WHERE role = 'manager' AND org_id = org_id
    User.query.filter_by(role="manager", org_id=org_id).delete()

    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=int(time.time() * 1000),
        action="delete_org",
        by_username=get_current_username(),
        org_id=org_id,
        details=f"ลบหน่วยงาน: {org.name}",
    ))

    # ลบหน่วยงาน
    db.session.delete(org)
    db.session.commit()
    return jsonify(message="ลบหน่วยงานสำเร็จ"), 200
