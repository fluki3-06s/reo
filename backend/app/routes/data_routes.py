"""
Data Routes - ดึงข้อมูลทั้งหมดในระบบครั้งเดียว
Maintainer: ไม่ระบุ

================================================================================
วัตถุประสงค์ของไฟล์:
================================================================================
ไฟล์นี้มีไว้สำหรับดึงข้อมูลทั้งหมดในระบบ (orgs, users, projects, audit) 
ในครั้งเดียว เพื่อให้ frontend สามารถเก็บข้อมูลไว้ใน memory (window.DB)
ทำให้สามารถ:

1. ลดจำนวน API request - แทนที่จะต้องเรียก API 4-5 ครั้งแยกกัน
   (สำหรับ orgs, users, projects, audit) ก็ดึงมาครั้งเดียว
   
2. ทำงานแบบ Offline/Quick Navigation - ข้อมูลอยู่ใน memory ทำให้
   การสลับหน้า (navigation) ระหว่างหน้าต่างๆ รวดเร็ว ไม่ต้องรอ API call ใหม่
   
3. Local Caching - Frontend ใช้ข้อมูลนี้เป็น "source of truth" ใน client-side
   และจะเรียก refreshFromApi() เมื่อต้องการ sync ข้อมูลใหม่หลังจากมีการแก้ไข

================================================================================
การทำงาน:
================================================================================
เมื่อผู้ใช้ login สำเร็จ:
1. Frontend เรียก GET /api/data/full
2. Backend ดึงข้อมูลจาก database
3. Backend ส่งข้อมูลทั้งหมดกลับไปเป็น JSON
4. Frontend เก็บข้อมูลไว้ใน window.DB
5. หน้าต่างๆ (Dashboard, Projects, Organizations ฯลฯ) อ่านข้อมูลจาก window.DB
6. เมื่อมีการแก้ไขข้อมูล (เพิ่ม/แก้ไข/ลบ) จะเรียก refreshFromApi() เพื่ออัปเดต window.DB

================================================================================
Security:
================================================================================
- ต้อง login ก่อนถึงจะเข้าถึงได้ (require_login)
- Audit logs จะส่งกลับเฉพาะเมื่อ role เป็น admin เท่านั้น
- Manager จะไม่เห็น audit logs ของระบบ
"""
from __future__ import annotations

from flask import Blueprint, jsonify

from app.models import AuditLog, Org, Project, ProjectImage, User
from app.utils import get_current_user, require_login

# สร้าง Blueprint สำหรับจัดการ data routes
# Blueprint คือวิธีการจัดกลุ่ม route แยกเป็น module
data_bp = Blueprint("data", __name__)


@data_bp.route("/full", methods=["GET"])
def get_full_data():
    """
    Endpoint หลักสำหรับดึงข้อมูลทั้งหมดในระบบ
    
    Request: GET /api/data/full
    Auth: ต้อง login ก่อน (session ที่ถูกต้อง)
    
    Response:
        {
            "orgs": [...],      # รายชื่อหน่วยงานทั้งหมด
            "users": [...],    # รายชื่อผู้ใช้ทั้งหมด
            "projects": [...], # โครงการทั้งหมด
            "audit": [...]     # ประวัติการทำงาน (เฉพาะ admin)
        }
    
    ขั้นตอนการทำงาน:
    1. ตรวจสอบว่า user ล็อกอินแล้วหรือยัง
    2. ดึง session ของ user ปัจจุบัน
    3. Query ข้อมูล orgs, users, projects, audit จาก database
    4. แปลงข้อมูลเป็น JSON format
    5. ส่งกลับไปให้ frontend
    """
    # ตรวจสอบว่า user ล็อกอินแล้วหรือยัง
    # ถ้ายังจะ return 401 error
    err = require_login()
    if err:
        return err
    
    # ดึงข้อมูล user ปัจจุบันจาก session
    user = get_current_user()

    # ดึงรายชื่อหน่วยงานทั้งหมด เรียงตามชื่อ (A-Z)
    # Query: SELECT * FROM orgs ORDER BY name ASC
    orgs = Org.query.order_by(Org.name).all()
    
    # ดึงรายชื่อผู้ใช้ทั้งหมด
    # Query: SELECT * FROM users
    users = User.query.all()

    # ดึงโครงการทั้งหมด เรียงตามวันที่แก้ไขล่าสุด (ใหม่สุดอยู่บน)
    # Query: SELECT * FROM projects ORDER BY updated_at DESC
    # ทั้ง admin และ manager เห็นโครงการทุกหน่วยงาน (ไม่มีการกรองตาม org)
    projects = Project.query.order_by(Project.updated_at.desc()).all()

    # ดึงประวัติการทำงาน (Audit Logs)
    # แต่จะส่งกลับเฉพาะเมื่อ role เป็น admin เท่านั้น
    # Manager จะได้รับ array ว่าง
    audit = []
    if user.role == "admin":
        # ดึง audit logs 500 รายการล่าสุด เรียงจากใหม่ไปเก่า
        # Query: SELECT * FROM audit_logs ORDER BY at DESC LIMIT 500
        for log in AuditLog.query.order_by(AuditLog.at.desc()).limit(500).all():
            audit.append({
                "at": log.at,              # timestamp (milliseconds)
                "action": log.action,      # ประเภทการกระทำ (create_project, update_org, etc.)
                "by": log.by_username,     # ผู้ทำการ
                "projectId": log.project_id,    # ID ของโครงการที่เกี่ยวข้อง
                "projectTitle": log.project_title, # ชื่อโครงการ
                "orgId": log.org_id,        # ID ของหน่วยงานที่เกี่ยวข้อง
                "details": log.details,     # รายละเอียดเพิ่มเติม
            })

    # แปลงข้อมูล orgs เป็น JSON format
    # สำหรับ: id, name, active, pin (รวม PIN ด้วยสำหรับ admin)
    org_list = [
        {
            "id": o.id,
            "name": o.name,
            "active": o.active,
            "pin": o.pin
        } 
        for o in orgs
    ]
    
    # แปลงข้อมูล users เป็น JSON format
    # สำหรับ: id, username, password (plain text!), role, orgId, active
    # หมายเหตุ: password ถูกส่งเป็น plain text - ใช้ในระบบที่มีความน่าเชื่อถือภายในเท่านั้น
    user_list = [
        {
            "id": u.id,
            "username": u.username,
            "password": u.password,
            "role": u.role,
            "orgId": u.org_id,
            "active": u.active
        } 
        for u in users
    ]
    
    # แปลงข้อมูล projects เป็น JSON format
    # รวมถึงรูปภาพที่เกี่ยวข้อง (ProjectImage)
    project_list = []
    for p in projects:
        # ดึงรูปภาพทั้งหมดของโครงการนี้
        images = [
            {
                "id": i.id,
                "name": i.name,
                "dataUrl": i.data_url  # base64 encoded image data
            } 
            for i in p.images
        ]
        
        project_list.append({
            "id": p.id,
            "orgId": p.org_id,
            "title": p.title,
            "budget": p.budget,
            "objective": p.objective,
            "policy": p.policy,
            "owner": p.owner,
            "year": p.year,
            # แปลง date object เป็น ISO format string (YYYY-MM-DD)
            "startDate": p.start_date.isoformat() if p.start_date else None,
            "endDate": p.end_date.isoformat() if p.end_date else None,
            "sdg": p.sdg or [],  # JSON array ของ SDG targets เช่น ["4.1", "4.2"]
            "images": images,
            # แปลง datetime object เป็น milliseconds timestamp
            "createdAt": int(p.created_at.timestamp() * 1000) if p.created_at else None,
            "updatedAt": int(p.updated_at.timestamp() * 1000) if p.updated_at else None,
            "updatedBy": p.updated_by,  # username ของผู้แก้ไขล่าสุด
        })

    # ส่งข้อมูลทั้งหมดกลับไปเป็น JSON response
    return jsonify(
        orgs=org_list,
        users=user_list,
        projects=project_list,
        audit=audit,
    ), 200
