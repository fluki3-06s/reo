"""
Dashboard Routes - ข้อมูลสถิติสำหรับหน้า Dashboard

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการ endpoints สำหรับ Dashboard
โดยจะรวบรวมข้อมูลสถิติต่างๆ ที่ใช้แสดงในหน้า Dashboard

มี endpoints ดังนี้:

1. GET /api/dashboard/          - ข้อมูลสถิติหลัก
2. GET /api/dashboard/by-org    - สถิติรายหน่วยงาน
3. GET /api/dashboard/by-sdg    - สถิติราย SDG Target

================================================================================
Dashboard Statistics:
================================================================================
ข้อมูลสถิติหลักที่แสดง:
- จำนวนโครงการทั้งหมด
- งบประมาณรวมทั้งหมด
- จำนวนหน่วยงานทั้งหมด
- จำนวนโครงการที่ active (กำลังดำเนินการ)

สถิติรายหน่วยงาน:
- ชื่อหน่วยงาน
- จำนวนโครงการ
- งบประมาณรวม
- SDG targets ที่เกี่ยวข้อง

สถิติราย SDG:
- รายการ SDG targets ที่ใช้งาน
- จำนวนโครงการต่อ target
- งบประมาณรวมต่อ target

================================================================================
Authorization:
================================================================================
ทุก endpoints: ต้อง login (admin หรือ manager)
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.models import Org, Project
from app.utils import require_login

# สร้าง Blueprint สำหรับ dashboard routes
dashboard_bp = Blueprint("dashboard", __name__)


def _get_active_projects():
    """
    ดึงโครงการที่กำลังดำเนินการ (active)
    
    Active หมายถึง:
    - วันสิ้นสุด >= วันปัจจุบัน
    
    Returns:
        list of Project objects ที่ active
    """
    from datetime import date
    today = date.today()
    
    # โครงการ active = วันสิ้นสุด >= วันปัจจุบัน
    # หมายถึงยังไม่สิ้นสุด
    return Project.query.filter(Project.end_date >= today).all()


@dashboard_bp.route("/", methods=["GET"])
def get_dashboard():
    """
    ดึงข้อมูลสถิติหลักสำหรับ Dashboard
    
    Method: GET
    URL: /api/dashboard/
    Authorization: ต้อง login
    
    Query Parameters (optional):
        year - กรองตามปีงบประมาณ (เช่น 2569)
    
    Response:
        HTTP 200
        {
            "total": {
                "projects": 150,       // จำนวนโครงการทั้งหมด
                "budget": 50000000,    // งบประมาณรวม
                "orgs": 35,           // จำนวนหน่วยงาน
                "activeProjects": 120  // โครงการที่กำลังดำเนินการ
            },
            "year": 2569              // ปีที่ filter (ถ้ามี)
        }
    """
    # ตรวจสอบ login
    err = require_login()
    if err:
        return err

    # รับ year parameter
    year = request.args.get("year")
    year_int = None
    if year:
        try:
            year_int = int(year)
        except ValueError:
            pass

    # ดึงโครงการทั้งหมด (กรองตาม year ถ้ามี)
    q = Project.query
    if year_int:
        q = q.filter_by(year=year_int)
    all_projects = q.all()
    
    # คำนวณสถิติ
    total_projects = len(all_projects)
    total_budget = sum(p.budget or 0 for p in all_projects)
    total_orgs = Org.query.count()
    
    # นับโครงการ active
    if year_int:
        from datetime import date
        today = date.today()
        active_count = sum(
            1 for p in all_projects 
            if p.end_date and p.end_date >= today
        )
    else:
        active_count = len(_get_active_projects())

    return jsonify(
        total={
            "projects": total_projects,
            "budget": total_budget,
            "orgs": total_orgs,
            "activeProjects": active_count,
        },
        year=year_int,
    ), 200


@dashboard_bp.route("/summary", methods=["GET"])
def get_dashboard_summary():
    """
    ดึงข้อมูลสถิติหลักสำหรับ Dashboard (Alias สำหรับ /api/dashboard/)
    
    Method: GET
    URL: /api/dashboard/summary
    Authorization: ต้อง login
    
    Query Parameters (optional):
        year - กรองตามปีงบประมาณ (เช่น 2569)
    
    Response:
        HTTP 200
        {
            "totalProjects": 150,
            "totalBudget": 50000000,
            "totalOrgs": 35,
            "activeProjects": 120
        }
    """
    # ตรวจสอบ login
    err = require_login()
    if err:
        return err

    # รับ year parameter
    year = request.args.get("year")
    year_int = None
    if year:
        try:
            year_int = int(year)
        except ValueError:
            pass

    # ดึงโครงการทั้งหมด (กรองตาม year ถ้ามี)
    q = Project.query
    if year_int:
        q = q.filter_by(year=year_int)
    all_projects = q.all()
    
    # คำนวณสถิติ
    total_projects = len(all_projects)
    total_budget = sum(p.budget or 0 for p in all_projects)
    total_orgs = Org.query.count()
    
    # นับโครงการ active
    if year_int:
        from datetime import date
        today = date.today()
        active_count = sum(
            1 for p in all_projects 
            if p.end_date and p.end_date >= today
        )
    else:
        active_count = len(_get_active_projects())

    # ส่ง response ใน format ที่ frontend คาดหวัง
    return jsonify(
        totalProjects=total_projects,
        totalBudget=total_budget,
        totalOrgs=total_orgs,
        activeProjects=active_count,
    ), 200


@dashboard_bp.route("/by-org", methods=["GET"])
def get_dashboard_by_org():
    """
    ดึงสถิติรายหน่วยงาน
    
    Method: GET
    URL: /api/dashboard/by-org
    Authorization: ต้อง login
    
    Query Parameters (optional):
        year - กรองตามปีงบประมาณ
    
    Response:
        HTTP 200
        {
            "items": [
                {
                    "orgId": "org-001",
                    "orgName": "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
                    "projectCount": 5,
                    "budget": 500000,
                    "sdgs": ["4.1", "4.2", "4.c"]
                },
                ...
            ]
        }
    """
    # ตรวจสอบ login
    err = require_login()
    if err:
        return err

    # รับ year parameter
    year = request.args.get("year")
    year_int = None
    if year:
        try:
            year_int = int(year)
        except ValueError:
            pass

    # ดึงหน่วยงานทั้งหมด
    orgs = Org.query.order_by(Org.name).all()
    
    items = []
    for org in orgs:
        # ดึงโครงการของหน่วยงานนี้
        q = Project.query.filter_by(org_id=org.id)
        if year_int:
            q = q.filter_by(year=year_int)
        projects = q.all()
        
        # คำนวณสถิติ
        project_count = len(projects)
        budget = sum(p.budget or 0 for p in projects)
        
        # รวบรวม SDG targets
        sdgs = set()
        for p in projects:
            if p.sdg:
                sdgs.update(p.sdg)
        
        items.append({
            "orgId": org.id,
            "orgName": org.name,
            "projectCount": project_count,
            "budget": budget,
            "sdgs": sorted(list(sdgs)),
        })
    
    return jsonify(items=items), 200


@dashboard_bp.route("/by-sdg", methods=["GET"])
def get_dashboard_by_sdg():
    """
    ดึงสถิติราย SDG Target
    
    Method: GET
    URL: /api/dashboard/by-sdg
    Authorization: ต้อง login
    
    Query Parameters (optional):
        year - กรองตามปีงบประมาณ
    
    Response:
        HTTP 200
        {
            "items": [
                {
                    "sdg": "4.1",
                    "projectCount": 45,
                    "budget": 12000000
                },
                {
                    "sdg": "4.2",
                    "projectCount": 38,
                    "budget": 9500000
                },
                ...
            ]
        }
    """
    # ตรวจสอบ login
    err = require_login()
    if err:
        return err

    # รับ year parameter
    year = request.args.get("year")
    year_int = None
    if year:
        try:
            year_int = int(year)
        except ValueError:
            pass

    # ดึงโครงการทั้งหมด (กรองตาม year ถ้ามี)
    q = Project.query
    if year_int:
        q = q.filter_by(year=year_int)
    all_projects = q.all()
    
    # รวบรวมสถิติตาม SDG
    # ใช้ dict เพื่อนับ: { "4.1": {count: 0, budget: 0} }
    sdg_stats: dict[str, dict] = {}
    
    for p in all_projects:
        if not p.sdg:
            continue
        
        # นับโครงการ + งบประมาณ สำหรับแต่ละ SDG
        for sdg_target in p.sdg:
            if sdg_target not in sdg_stats:
                sdg_stats[sdg_target] = {"count": 0, "budget": 0}
            sdg_stats[sdg_target]["count"] += 1
            sdg_stats[sdg_target]["budget"] += p.budget or 0
    
    # แปลงเป็น list และเรียงตามจำนวนโครงการ (มากไปน้อย)
    items = [
        {
            "sdg": sdg,
            "projectCount": stats["count"],
            "budget": stats["budget"],
        }
        for sdg, stats in sdg_stats.items()
    ]
    items.sort(key=lambda x: x["projectCount"], reverse=True)
    
    return jsonify(items=items), 200
