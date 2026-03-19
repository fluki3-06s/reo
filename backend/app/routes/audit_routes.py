"""
Audit Routes - ประวัติการทำงานในระบบ

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการ endpoints สำหรับดูประวัติการทำงาน (Audit Logs)
ในระบบ มี 1 endpoint:

1. GET /api/audit/ - ดึงประวัติการทำงานทั้งหมด (Admin only)

================================================================================
Audit Log คืออะไร:
================================================================================
Audit Log คือบันทึกการทำงานทุกอย่างในระบบ
ใช้สำหรับติดตามว่าใครทำอะไร เมื่อไหร่

ตัวอย่างการบันทึก:
- "admin สร้างโครงการ: โครงการพัฒนาทักษะดิจิทัล"
- "mgr-org-001 อัปโหลดรูป 3 รูป"
- "admin เปลี่ยน PIN หน่วยงาน สพป.นม.1"

================================================================================
Actions ที่ถูกบันทึก:
================================================================================
- create_project  - สร้างโครงการใหม่
- update_project  - แก้ไขโครงการ
- delete_project  - ลบโครงการ
- create_org     - สร้างหน่วยงานใหม่
- update_org     - แก้ไขชื่อหน่วยงาน
- enable_org     - เปิดหน่วยงาน
- disable_org    - ปิดหน่วยงาน
- delete_org     - ลบหน่วยงาน
- set_org_pin    - เปลี่ยน PIN หน่วยงาน
- upload_image   - อัปโหลดรูป
- delete_image   - ลบรูป

================================================================================
Authorization:
================================================================================
เฉพาะ Admin เท่านั้นที่เข้าถึง Audit Logs ได้
(Manager ไม่สามารถดูประวัติการทำงานได้)
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.models import AuditLog
from app.utils import require_admin

# สร้าง Blueprint สำหรับ audit routes
audit_bp = Blueprint("audit", __name__)


@audit_bp.route("/", methods=["GET"])
def list_audit_logs():
    """
    ดึงประวัติการทำงานทั้งหมด (Admin only)
    
    Method: GET
    URL: /api/audit/
    Authorization: Admin เท่านั้น
    
    Query Parameters (optional):
        action    - กรองตามประเภทการกระทำ (เช่น "create_project")
        by        - กรองตามผู้ทำ (username)
        orgId     - กรองตามหน่วยงานที่เกี่ยวข้อง
        projectId - กรองตามโครงการที่เกี่ยวข้อง
        limit     - จำนวนรายการที่ต้องการ (default: 500)
    
    Response:
        HTTP 200
        {
            "items": [
                {
                    "at": 1679650123456,           // timestamp (milliseconds)
                    "action": "create_project",
                    "by": "admin",
                    "projectId": "p-1",
                    "projectTitle": "โครงการพัฒนาทักษะดิจิทัล",
                    "orgId": "org-023",
                    "details": "สร้างโครงการใหม่: โครงการพัฒนาทักษะดิจิทัล"
                },
                ...
            ]
        }
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err

    # รับ query parameters สำหรับ filtering
    action = request.args.get("action")
    by_username = request.args.get("by")
    org_id = request.args.get("orgId")
    project_id = request.args.get("projectId")
    
    # รับ limit (default: 500)
    try:
        limit = int(request.args.get("limit", 500))
    except ValueError:
        limit = 500
    
    # จำกัด limit สูงสุดไว้ที่ 1000
    if limit > 1000:
        limit = 1000

    # สร้าง query
    q = AuditLog.query

    # กรองตาม action
    if action:
        q = q.filter_by(action=action)
    
    # กรองตามผู้ทำ
    if by_username:
        q = q.filter_by(by_username=by_username)
    
    # กรองตามหน่วยงาน
    if org_id:
        q = q.filter_by(org_id=org_id)
    
    # กรองตามโครงการ
    if project_id:
        q = q.filter_by(project_id=project_id)

    # ดึงข้อมูล เรียงจากใหม่ไปเก่า
    logs = q.order_by(AuditLog.at.desc()).limit(limit).all()

    # แปลงเป็น JSON format
    items = [
        {
            "at": log.at,                    # timestamp (milliseconds)
            "action": log.action,            # ประเภทการกระทำ
            "by": log.by_username,           # ผู้ทำ
            "projectId": log.project_id,     # ID โครงการ (ถ้ามี)
            "projectTitle": log.project_title, # ชื่อโครงการ (ถ้ามี)
            "orgId": log.org_id,             # ID หน่วยงาน (ถ้ามี)
            "details": log.details,          # รายละเอียด
        }
        for log in logs
    ]

    return jsonify(items=items), 200
