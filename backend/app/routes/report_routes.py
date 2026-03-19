"""
Report Routes - ส่งออกข้อมูลโครงการเป็นไฟล์

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการ endpoints สำหรับส่งออกข้อมูลโครงการ

มี 1 endpoint:

1. GET /api/report/export    - ส่งออกข้อมูลโครงการเป็น CSV

================================================================================
CSV Export Format:
================================================================================
Columns:
- ลำดับที่
- ชื่อโครงการ
- หน่วยงาน
- ผู้รับผิดชอบ
- ปีงบประมาณ
- วันเริ่มต้น
- วันสิ้นสุด
- งบประมาณ (บาท)
- SDG Targets

================================================================================
Encoding:
================================================================================
ใช้ UTF-8 BOM เพื่อให้ Excel อ่านภาษาไทยได้ถูกต้อง

ชื่อไฟล์: projects_report_YYYYMMDD.csv

================================================================================
Authorization:
================================================================================
ต้อง login (admin หรือ manager)
"""
from __future__ import annotations

import csv
import io

from flask import Blueprint, Response, request

from app.models import Org, Project
from app.utils import require_login

# สร้าง Blueprint สำหรับ report routes
report_bp = Blueprint("report", __name__)


@report_bp.route("/export", methods=["GET"])
def export_csv():
    """
    ส่งออกข้อมูลโครงการเป็น CSV
    
    Method: GET
    URL: /api/report/export
    Authorization: ต้อง login
    
    Query Parameters (optional):
        orgId - กรองตามหน่วยงาน
        year  - กรองตามปีงบประมาณ
    
    Response:
        Content-Type: text/csv; charset=utf-8
        Content-Disposition: attachment; filename="projects_report_YYYYMMDD.csv"
        
        ไฟล์ CSV ที่มีข้อมูลโครงการทั้งหมด
    """
    # ตรวจสอบ login
    err = require_login()
    if err:
        return err

    # รับ parameters
    org_id = request.args.get("orgId")
    year = request.args.get("year")
    year_int = None
    if year:
        try:
            year_int = int(year)
        except ValueError:
            pass

    # สร้าง CSV ใน memory
    output = io.StringIO()
    
    # สร้าง CSV writer
    # lineterminator='\n' ทำให้ CSV ใช้ได้ทั้ง Windows และ Mac
    writer = csv.writer(output, lineterminator='\n')
    
    # เขียน BOM (UTF-8 with BOM)
    # ทำให้ Excel อ่านภาษาไทยได้ถูกต้อง
    # BOM = Byte Order Mark = EF BB BF (hex)
    output.write('\ufeff')
    
    # เขียน header
    writer.writerow([
        "ลำดับที่",
        "ชื่อโครงการ",
        "หน่วยงาน",
        "ผู้รับผิดชอบ",
        "ปีงบประมาณ",
        "วันเริ่มต้น",
        "วันสิ้นสุด",
        "งบประมาณ (บาท)",
        "SDG Targets",
    ])

    # ดึงโครงการทั้งหมด (กรองตาม orgId, year)
    q = Project.query
    if org_id:
        q = q.filter_by(org_id=org_id)
    if year_int:
        q = q.filter_by(year=year_int)
    projects = q.order_by(Project.title).all()

    # ดึงชื่อหน่วยงาน (cache เพื่อลด query)
    org_names: dict[str, str] = {}
    
    # เขียนข้อมูลแต่ละโครงการ
    for i, p in enumerate(projects, 1):
        # ดึงชื่อหน่วยงาน (ใช้ cache ถ้ามี)
        if p.org_id not in org_names:
            org = Org.query.get(p.org_id)
            org_names[p.org_id] = org.name if org else "ไม่ระบุ"
        org_name = org_names[p.org_id]
        
        # จัดรูปแบบวันที่
        start_str = p.start_date.isoformat() if p.start_date else ""
        end_str = p.end_date.isoformat() if p.end_date else ""
        
        # จัดรูปแบบ SDG
        sdg_str = ", ".join(p.sdg) if p.sdg else ""
        
        # เขียน row
        writer.writerow([
            i,
            p.title,
            org_name,
            p.owner or "",
            p.year or "",
            start_str,
            end_str,
            p.budget or 0,
            sdg_str,
        ])

    # สร้าง filename
    from datetime import datetime
    now = datetime.now()
    filename = f"projects_report_{now.strftime('%Y%m%d_%H%M%S')}.csv"
    
    # ส่ง response
    return Response(
        output.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{filename}",
        },
    )
