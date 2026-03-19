"""
Project Routes - จัดการโครงการ (CRUD Operations)

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการเกี่ยวกับการ CRUD (Create, Read, Update, Delete) โครงการ
และการจัดการรูปภาพประกอบโครงการ

มี endpoints ดังนี้:

--- ดึงข้อมูล ---
1. GET  /api/projects/           - ดึงรายการโครงการทั้งหมด
2. GET  /api/projects/all       - ดึงรายการโครงการทั้งหมด (เหมือนกับ /)
3. GET  /api/projects/<id>    - ดึงรายละเอียดโครงการ

--- จัดการโครงการ ---
4. POST /api/projects/          - สร้างโครงการใหม่
5. PUT  /api/projects/<id>     - แก้ไขโครงการ
6. DELETE /api/projects/<id>   - ลบโครงการ

--- จัดการรูปภาพ ---
7. POST /api/projects/<id>/images        - อัปโหลดรูปภาพเพิ่มเติม
8. DELETE /api/projects/<id>/images/<id> - ลบรูปภาพ

================================================================================
Validation Rules:
================================================================================
การสร้างโครงการ:
- title ห้ามว่าง
- orgId ต้องระบุ (admin ต้องระบุ, manager ใช้ orgId ของตัวเอง)
- budget ต้อง >= 0
- year ต้องอยู่ระหว่าง 2400-2600
- start_date ต้อง <= end_date
- objective ห้ามว่าง
- policy ห้ามว่าง
- sdg ต้องมีอย่างน้อย 1 target
- images ต้องมี 3-4 รูป

================================================================================
Authorization:
================================================================================
- ทุกคน (admin และ manager) ดูโครงการได้ทุกหน่วยงาน
- แก้ไข/ลบ: admin ทำได้ทุกโครงการ, manager ทำได้เฉพาะของหน่วยงานตัวเอง
"""
from __future__ import annotations

import time
import uuid
from datetime import datetime

from flask import Blueprint, jsonify, request

from app.database import db
from app.models import AuditLog, Org, Project, ProjectImage, User
from app.utils import get_current_user, get_current_username, require_login

# สร้าง Blueprint สำหรับ project routes
project_bp = Blueprint("projects", __name__)


def _project_to_json(p: Project) -> dict:
    """
    แปลง Project object เป็น dictionary สำหรับ JSON response
    
    Args:
        p: Project object
        
    Returns:
        dict ที่มีฟิลด์: id, orgId, title, budget, objective, policy, 
        owner, year, startDate, endDate, sdg, images, createdAt, updatedAt, updatedBy
    """
    # ดึงรูปภาพทั้งหมดของโครงการ
    images = [
        {
            "id": i.id,
            "name": i.name,
            "dataUrl": i.data_url  # base64 data URL
        } 
        for i in p.images
    ]
    
    return {
        "id": p.id,
        "orgId": p.org_id,
        "title": p.title,
        "budget": p.budget,
        "objective": p.objective,
        "policy": p.policy,
        "owner": p.owner,
        "year": p.year,
        # แปลง date เป็น ISO format string (YYYY-MM-DD)
        "startDate": p.start_date.isoformat() if p.start_date else None,
        "endDate": p.end_date.isoformat() if p.end_date else None,
        "sdg": p.sdg or [],  # JSON array
        "images": images,
        # แปลง datetime เป็น milliseconds timestamp
        "createdAt": int(p.created_at.timestamp() * 1000) if p.created_at else None,
        "updatedAt": int(p.updated_at.timestamp() * 1000) if p.updated_at else None,
        "updatedBy": p.updated_by,  # username ของผู้แก้ไขล่าสุด
    }


def _safe_strip(val):
    """
    ตัดช่องว่างข้างหน้า/หลังของค่าที่ส่งมา
    รองรับทั้ง string และ number
    
    Args:
        val: ค่าที่ต้องการตัดช่องว่าง
        
    Returns:
        string ที่ตัดช่องว่างแล้ว, ถ้า val เป็น None จะ return ""
    """
    if val is None:
        return ""
    return str(val).strip()


def _parse_date(s):
    """
    แปลง string เป็น Python date object
    รองรับ format: "YYYY-MM-DD"
    
    Args:
        s: date string ที่รูปแบบ YYYY-MM-DD
        
    Returns:
        date object หรือ None ถ้าแปลงไม่ได้
    """
    if s is None:
        return None
    s = str(s) if not isinstance(s, str) else s
    if not s.strip():
        return None
    try:
        # ใช้ slice [:10] เพื่อรองรับกรณีมีเวลาต่อท้าย เช่น "2025-01-01T00:00:00"
        return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except Exception:
        return None


def _check_can_edit(project: Project, user: User) -> bool:
    """
    ตรวจสอบว่าผู้ใช้มีสิทธิ์แก้ไขโครงการหรือไม่
    
    Args:
        project: โครงการที่ต้องการแก้ไข
        user: ผู้ใช้ปัจจุบัน
        
    Returns:
        True ถ้ามีสิทธิ์, False ถ้าไม่มีสิทธิ์
        
    Logic:
        - admin: แก้ไขได้ทุกโครงการ
        - manager: แก้ไขได้เฉพาะโครงการของหน่วยงานตัวเอง
    """
    if user.role == "admin":
        return True  # admin แก้ไขได้ทุกโครงการ
    if user.role == "manager" and project.org_id == user.org_id:
        return True  # manager แก้ไขได้เฉพาะของหน่วยงานตัวเอง
    return False


# ========================================
# READ Operations
# ========================================

@project_bp.route("/", methods=["GET"])
def list_projects():
    """
    ดึงรายการโครงการทั้งหมด
    
    Method: GET
    URL: /api/projects/
    Authorization: ต้อง login
    
    Query Parameters (optional):
        orgId  - กรองตามหน่วยงาน
        sdg    - กรองตาม SDG target
        year   - กรองตามปีงบประมาณ
        search - ค้นหาตามชื่อโครงการ (case-insensitive)
    
    Returns:
        HTTP 200: { "items": [...] }
    """
    # ตรวจสอบ login
    err = require_login()
    if err:
        return err

    # รับ query parameters
    org_id = request.args.get("orgId")
    sdg = request.args.get("sdg")
    year = request.args.get("year")
    search = (request.args.get("search") or "").strip().lower()

    # สร้าง query
    q = Project.query

    # กรองตาม orgId
    if org_id:
        q = q.filter_by(org_id=org_id)
    
    # กรองตามปีงบประมาณ
    if year:
        try:
            q = q.filter_by(year=int(year))
        except ValueError:
            pass  # ถ้าไม่ใช่ตัวเลข ไม่กรอง
    
    # ค้นหาตามชื่อ (case-insensitive)
    if search:
        q = q.filter(Project.title.ilike(f"%{search}%"))

    # ดึงข้อมูล เรียงตามวันที่แก้ไขล่าสุด
    projects = q.order_by(Project.updated_at.desc()).all()
    
    # กรองตาม SDG (ทำใน Python เพราะ sdg เป็น JSON column)
    if sdg:
        projects = [p for p in projects if p.sdg and sdg in p.sdg]

    # แปลงเป็น JSON และส่งกลับ
    items = [_project_to_json(p) for p in projects]
    return jsonify(items=items), 200


@project_bp.route("/all", methods=["GET"])
def list_all_projects():
    """
    ดึงรายการโครงการทั้งหมด (เหมือนกับ /)
    
    Method: GET
    URL: /api/projects/all
    Authorization: ต้อง login
    """
    err = require_login()
    if err:
        return err

    org_id = request.args.get("orgId")
    sdg = request.args.get("sdg")
    year = request.args.get("year")
    search = (request.args.get("search") or "").strip().lower()

    q = Project.query
    if org_id:
        q = q.filter_by(org_id=org_id)
    if year:
        try:
            q = q.filter_by(year=int(year))
        except ValueError:
            pass
    if search:
        q = q.filter(Project.title.ilike(f"%{search}%"))

    projects = q.order_by(Project.updated_at.desc()).all()
    if sdg:
        projects = [p for p in projects if p.sdg and sdg in p.sdg]
    items = [_project_to_json(p) for p in projects]
    return jsonify(items=items), 200


@project_bp.route("/<project_id>", methods=["GET"])
def get_project(project_id: str):
    """
    ดึงรายละเอียดโครงการ
    
    Method: GET
    URL: /api/projects/<project_id>
    Authorization: ต้อง login
    
    Returns:
        HTTP 200: { "item": {...} }
        HTTP 404: ไม่พบโครงการ
    """
    err = require_login()
    if err:
        return err

    # ค้นหาโครงการ
    p = Project.query.get(project_id)
    if not p:
        return jsonify(message="ไม่พบโครงการ"), 404
    
    # ส่งข้อมูลกลับ
    return jsonify(item=_project_to_json(p)), 200


# ========================================
# CREATE Operation
# ========================================

@project_bp.route("/", methods=["POST"])
def create_project():
    """
    สร้างโครงการใหม่
    
    Method: POST
    URL: /api/projects/
    Authorization: ต้อง login (admin หรือ manager)
    
    Request Body:
        {
            "title": "ชื่อโครงการ",
            "orgId": "org-001",        // ถ้าไม่ระบุ manager จะใช้ orgId ของตัวเอง
            "budget": 100000,
            "owner": "ผู้รับผิดชอบ",
            "year": 2569,
            "startDate": "2025-01-01",
            "endDate": "2025-12-31",
            "objective": "วัตถุประสงค์",
            "policy": "นโยบาย",
            "sdg": ["4.1", "4.2"],
            "images": [
                {"id": "img1", "name": "รูป1.jpg", "dataUrl": "data:image/..."},
                {"id": "img2", "name": "รูป2.jpg", "dataUrl": "data:image/..."},
                {"id": "img3", "name": "รูป3.jpg", "dataUrl": "data:image/..."}
            ]
        }
    
    Returns:
        HTTP 201: { "item": {...}, "message": "สร้างโครงการสำเร็จ" }
        HTTP 400: validation error
    """
    err = require_login()
    if err:
        return err
    user = get_current_user()

    # รับข้อมูลจาก request
    data = request.get_json(silent=True) or {}
    title = _safe_strip(data.get("title"))
    
    # ตรวจสอบ title
    if not title:
        return jsonify(message="กรุณาระบุชื่อโครงการ"), 400

    # กำหนด orgId
    org_id = data.get("orgId") or data.get("org_id")
    if user.role == "manager":
        # manager ต้องใช้ orgId ของตัวเอง
        org_id = user.org_id
    if not org_id:
        return jsonify(message="กรุณาระบุหน่วยงาน"), 400

    # ตรวจสอบ budget
    try:
        budget_val = float(data.get("budget") or 0)
        if budget_val < 0:
            return jsonify(message="กรุณาระบุงบประมาณให้ถูกต้อง"), 400
    except (TypeError, ValueError):
        return jsonify(message="กรุณาระบุงบประมาณให้ถูกต้อง"), 400

    # ตรวจสอบ owner
    owner = _safe_strip(data.get("owner"))
    if not owner:
        return jsonify(message="กรุณาระบุผู้รับผิดชอบ"), 400

    # ตรวจสอบ year
    year = data.get("year")
    if not year or (isinstance(year, (int, float)) and (year < 2400 or year > 2600)):
        return jsonify(message="กรุณาระบุปีงบประมาณให้ถูกต้อง"), 400

    # ตรวจสอบวันที่
    start_date = _parse_date(data.get("startDate") or data.get("start_date"))
    if not start_date:
        return jsonify(message="กรุณาระบุวันเริ่มต้น"), 400

    end_date = _parse_date(data.get("endDate") or data.get("end_date"))
    if not end_date:
        return jsonify(message="กรุณาระบุวันสิ้นสุด"), 400
    if start_date > end_date:
        return jsonify(message="วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น"), 400

    # ตรวจสอบ objective
    objective = _safe_strip(data.get("objective"))
    if not objective:
        return jsonify(message="กรุณาระบุวัตถุประสงค์"), 400

    # ตรวจสอบ policy
    policy = _safe_strip(data.get("policy"))
    if not policy:
        return jsonify(message="กรุณาระบุนโยบาย/ข้อเสนอแนะ"), 400

    # ตรวจสอบ SDG
    sdg = data.get("sdg") or []
    if not sdg:
        return jsonify(message="กรุณาเลือกอย่างน้อย 1 SDG Target"), 400

    # ตรวจสอบรูปภาพ
    images = data.get("images") or []
    if len(images) < 3:
        return jsonify(message="กรุณาอัปโหลดรูปกิจกรรมอย่างน้อย 3 รูป"), 400
    if len(images) > 4:
        return jsonify(message="รูปภาพต้องไม่เกิน 4 รูป"), 400

    # สร้าง ID ใหม่
    project_id = "p-" + uuid.uuid4().hex[:12]
    year_val = int(year) if year else 2569

    # สร้าง Project object
    p = Project(
        id=project_id,
        org_id=org_id,
        title=title,
        budget=budget_val,
        objective=objective,
        policy=policy,
        owner=owner,
        year=year_val,
        start_date=start_date,
        end_date=end_date,
        sdg=sdg,
        updated_by=user.username,
    )
    db.session.add(p)

    # สร้าง ProjectImage objects
    for img in images[:4]:  # จำกัด 4 รูป
        img_id = img.get("id") or "img-" + uuid.uuid4().hex[:8]
        pi = ProjectImage(
            id=img_id,
            project_id=project_id,
            name=img.get("name"),
            data_url=img.get("dataUrl") or img.get("data_url") or "",
        )
        db.session.add(pi)

    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=int(time.time() * 1000),
        action="create_project",
        by_username=user.username,
        project_id=project_id,
        project_title=title,
        org_id=org_id,
        details=f"สร้างโครงการใหม่: {title}",
    ))

    # Commit
    db.session.commit()

    # ดึงข้อมูลที่สร้างแล้วกลับไป
    p = Project.query.get(project_id)
    return jsonify(item=_project_to_json(p), message="สร้างโครงการสำเร็จ"), 201


# ========================================
# UPDATE Operation
# ========================================

@project_bp.route("/<project_id>", methods=["PUT"])
def update_project(project_id: str):
    """
    แก้ไขโครงการ
    
    Method: PUT
    URL: /api/projects/<project_id>
    Authorization: admin ทำได้ทุกโครงการ, manager ทำได้เฉพาะของหน่วยงานตัวเอง
    
    Request Body: เหมือนกับ POST แต่เป็น optional fields
    ถ้าไม่ส่ง field มา จะใช้ค่าเดิม
    
    Returns:
        HTTP 200: { "item": {...}, "message": "อัปเดตสำเร็จ" }
        HTTP 400: validation error
        HTTP 403: ไม่มีสิทธิ์
        HTTP 404: ไม่พบโครงการ
    """
    err = require_login()
    if err:
        return err
    user = get_current_user()

    # ค้นหาโครงการ
    p = Project.query.get(project_id)
    if not p:
        return jsonify(message="ไม่พบโครงการ"), 404
    
    # ตรวจสอบสิทธิ์
    if not _check_can_edit(p, user):
        return jsonify(message="ไม่มีสิทธิ์แก้ไขโครงการนี้"), 403

    # รับข้อมูล
    data = request.get_json(silent=True) or {}
    old_title = p.title

    # ตรวจสอบ title (ถ้าส่งมา)
    if "title" in data:
        title_raw = data.get("title")
        if title_raw is None:
            return jsonify(message="กรุณาระบุชื่อโครงการ"), 400
        t = _safe_strip(title_raw)
        if not t:
            return jsonify(message="กรุณาระบุชื่อโครงการ"), 400
    else:
        t = p.title  # ใช้ค่าเดิม

    # ตรวจสอบ budget
    try:
        budget_val = float(data.get("budget", p.budget) or 0)
        if budget_val < 0:
            return jsonify(message="กรุณาระบุงบประมาณให้ถูกต้อง"), 400
    except (TypeError, ValueError):
        return jsonify(message="กรุณาระบุงบประมาณให้ถูกต้อง"), 400

    # ตรวจสอบ owner
    owner_val = _safe_strip(data.get("owner") or p.owner or "")
    if not owner_val:
        return jsonify(message="กรุณาระบุผู้รับผิดชอบ"), 400

    # ตรวจสอบ year
    year_val = data.get("year", p.year)
    if not year_val or (isinstance(year_val, (int, float)) and (year_val < 2400 or year_val > 2600)):
        return jsonify(message="กรุณาระบุปีงบประมาณให้ถูกต้อง"), 400

    # ตรวจสอบวันที่
    start_date_val = _parse_date(data.get("startDate") or data.get("start_date")) or p.start_date
    if not start_date_val:
        return jsonify(message="กรุณาระบุวันเริ่มต้น"), 400

    end_date_val = _parse_date(data.get("endDate") or data.get("end_date")) or p.end_date
    if not end_date_val:
        return jsonify(message="กรุณาระบุวันสิ้นสุด"), 400
    if start_date_val > end_date_val:
        return jsonify(message="วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น"), 400

    # ตรวจสอบ objective
    objective_val = _safe_strip(data.get("objective") or p.objective or "")
    if not objective_val:
        return jsonify(message="กรุณาระบุวัตถุประสงค์"), 400

    # ตรวจสอบ policy
    policy_val = _safe_strip(data.get("policy") or p.policy or "")
    if not policy_val:
        return jsonify(message="กรุณาระบุนโยบาย/ข้อเสนอแนะ"), 400

    # ตรวจสอบ SDG
    sdg_val = data.get("sdg") or p.sdg or []
    if not sdg_val:
        return jsonify(message="กรุณาเลือกอย่างน้อย 1 SDG Target"), 400

    # ตรวจสอบรูปภาพ
    if "images" in data:
        images_val = data.get("images") or []
    else:
        # ใช้รูปเดิม
        images_val = [
            {"id": i.id, "name": i.name, "dataUrl": i.data_url} 
            for i in (p.images or [])
        ]
    
    if len(images_val) < 3:
        return jsonify(message="กรุณาอัปโหลดรูปกิจกรรมอย่างน้อย 3 รูป"), 400
    if len(images_val) > 4:
        return jsonify(message="รูปภาพต้องไม่เกิน 4 รูป"), 400

    # อัปเดตข้อมูล
    p.title = t
    p.budget = budget_val
    p.owner = owner_val
    p.year = int(year_val) if year_val else p.year
    p.start_date = start_date_val
    p.end_date = end_date_val
    p.objective = objective_val
    p.policy = policy_val
    p.sdg = sdg_val
    
    # admin สามารถเปลี่ยนหน่วยงานได้
    if "orgId" in data and user.role == "admin":
        p.org_id = data["orgId"]

    p.updated_by = user.username

    # อัปเดตรูปภาพ (ถ้ามีการส่ง images มา)
    if "images" in data:
        # ลบรูปเดิมทิ้ง
        ProjectImage.query.filter_by(project_id=project_id).delete()
        
        # เพิ่มรูปใหม่
        for img in images_val[:4]:
            img_id = img.get("id") or "img-" + uuid.uuid4().hex[:8]
            pi = ProjectImage(
                id=img_id,
                project_id=project_id,
                name=img.get("name"),
                data_url=img.get("dataUrl") or img.get("data_url") or "",
            )
            db.session.add(pi)

    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=int(time.time() * 1000),
        action="update_project",
        by_username=user.username,
        project_id=project_id,
        project_title=p.title,
        org_id=p.org_id,
        details=f"แก้ไขโครงการ: {old_title}",
    ))

    # Commit
    db.session.commit()

    # ส่งข้อมูลที่อัปเดตแล้วกลับ
    p = Project.query.get(project_id)
    return jsonify(item=_project_to_json(p), message="อัปเดตสำเร็จ"), 200


# ========================================
# DELETE Operation
# ========================================

@project_bp.route("/<project_id>", methods=["DELETE"])
def delete_project(project_id: str):
    """
    ลบโครงการ
    
    Method: DELETE
    URL: /api/projects/<project_id>
    Authorization: admin ทำได้ทุกโครงการ, manager ทำได้เฉพาะของหน่วยงานตัวเอง
    
    Returns:
        HTTP 200: { "message": "ลบโครงการสำเร็จ" }
        HTTP 403: ไม่มีสิทธิ์
        HTTP 404: ไม่พบโครงการ
    """
    err = require_login()
    if err:
        return err
    user = get_current_user()

    # ค้นหาโครงการ
    p = Project.query.get(project_id)
    if not p:
        return jsonify(message="ไม่พบโครงการ"), 404
    
    # ตรวจสอบสิทธิ์
    if not _check_can_edit(p, user):
        return jsonify(message="ไม่มีสิทธิ์ลบโครงการนี้"), 403

    # เก็บข้อมูลก่อนลบ (สำหรับ AuditLog)
    title = p.title
    org_id = p.org_id

    # บันทึก AuditLog (ก่อนลบ)
    db.session.add(AuditLog(
        at=int(time.time() * 1000),
        action="delete_project",
        by_username=user.username,
        project_id=project_id,
        project_title=title,
        org_id=org_id,
        details=f"ลบโครงการ: {title}",
    ))

    # ลบโครงการ (รูปภาพจะถูกลบด้วย cascade)
    db.session.delete(p)
    db.session.commit()
    
    return jsonify(message="ลบโครงการสำเร็จ"), 200


# ========================================
# Image Operations
# ========================================

@project_bp.route("/<project_id>/images", methods=["POST"])
def upload_project_images(project_id: str):
    """
    อัปโหลดรูปภาพเพิ่มเติม
    
    Method: POST
    URL: /api/projects/<project_id>/images
    Authorization: admin ทำได้ทุกโครงการ, manager ทำได้เฉพาะของหน่วยงานตัวเอง
    
    Request Body:
        {
            "images": [
                {"id": "img1", "name": "รูป4.jpg", "dataUrl": "data:image/..."}
            ]
        }
    
    Constraint:
        - รวมรูปเดิม + รูปใหม่ต้องไม่เกิน 4 รูป
    
    Returns:
        HTTP 201: { "item": {...}, "message": "อัปโหลดรูป X รูปสำเร็จ" }
    """
    err = require_login()
    if err:
        return err
    user = get_current_user()

    # ค้นหาโครงการ
    p = Project.query.get(project_id)
    if not p:
        return jsonify(message="ไม่พบโครงการ"), 404
    
    # ตรวจสอบสิทธิ์
    if not _check_can_edit(p, user):
        return jsonify(message="ไม่มีสิทธิ์แก้ไขโครงการนี้"), 403

    # รับข้อมูล
    data = request.get_json(silent=True) or {}
    images = data.get("images") or []
    
    # ตรวจสอบจำนวน
    existing = len(p.images)
    if existing + len(images) > 4:
        return jsonify(message="รูปภาพสูงสุด 4 รูป"), 400

    # เพิ่มรูปใหม่
    added = 0
    for img in images[: 4 - existing]:
        img_id = "img-" + uuid.uuid4().hex[:8]
        pi = ProjectImage(
            id=img_id,
            project_id=project_id,
            name=img.get("name"),
            data_url=img.get("dataUrl") or img.get("data_url") or "",
        )
        db.session.add(pi)
        added += 1

    p.updated_by = user.username
    
    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=int(time.time() * 1000),
        action="upload_image",
        by_username=user.username,
        project_id=project_id,
        project_title=p.title,
        org_id=p.org_id,
        details=f"อัปโหลดรูป {added} รูป",
    ))
    
    db.session.commit()
    
    # ส่งข้อมูลกลับ
    p = Project.query.get(project_id)
    return jsonify(item=_project_to_json(p), message=f"อัปโหลดรูป {added} รูปสำเร็จ"), 201


@project_bp.route("/<project_id>/images/<image_id>", methods=["DELETE"])
def delete_project_image(project_id: str, image_id: str):
    """
    ลบรูปภาพ
    
    Method: DELETE
    URL: /api/projects/<project_id>/images/<image_id>
    Authorization: admin ทำได้ทุกโครงการ, manager ทำได้เฉพาะของหน่วยงานตัวเอง
    
    Returns:
        HTTP 200: { "item": {...}, "message": "ลบรูปภาพสำเร็จ" }
        HTTP 404: ไม่พบรูปภาพ
    """
    err = require_login()
    if err:
        return err
    user = get_current_user()

    # ค้นหาโครงการ
    p = Project.query.get(project_id)
    if not p:
        return jsonify(message="ไม่พบโครงการ"), 404
    
    # ตรวจสอบสิทธิ์
    if not _check_can_edit(p, user):
        return jsonify(message="ไม่มีสิทธิ์แก้ไขโครงการนี้"), 403

    # ค้นหารูปภาพ
    img = ProjectImage.query.filter_by(id=image_id, project_id=project_id).first()
    if not img:
        return jsonify(message="ไม่พบรูปภาพ"), 404

    # ลบรูป
    db.session.delete(img)
    p.updated_by = user.username
    
    # บันทึก AuditLog
    db.session.add(AuditLog(
        at=int(time.time() * 1000),
        action="delete_image",
        by_username=user.username,
        project_id=project_id,
        project_title=p.title,
        org_id=p.org_id,
        details=f"ลบรูป: {img.name or 'unknown'}",
    ))
    
    db.session.commit()
    
    # ส่งข้อมูลกลับ
    p = Project.query.get(project_id)
    return jsonify(item=_project_to_json(p), message="ลบรูปภาพสำเร็จ"), 200
