"""
ไฟล์หลักสำหรับสร้าง Flask Application
ระบบ SDG4 Admin Dashboard - ระบบบริหารจัดการโครงการตามเป้าหมาย SDG 4
"""
from __future__ import annotations

import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .config import Config
from .database import db
from .routes.auth_routes import auth_bp
from .routes.dashboard_routes import dashboard_bp
from .routes.project_routes import project_bp
from .routes.report_routes import report_bp
from .routes.org_routes import org_bp
from .routes.pin_routes import pin_bp
from .routes.user_routes import user_bp
from .routes.audit_routes import audit_bp
from .routes.data_routes import data_bp


# กำหนดเส้นทางไปยังโฟลเดอร์ frontend
# โดยใช้ path ของไฟล์ปัจจุบัน (__file__) เป็นตัวอ้างอิง
# ขึ้นไป 2 ระดับจาก backend/app/ จะถึง SDG/ แล้วเข้า frontend/
_FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
)


def create_app(config_class: type[Config] = Config) -> Flask:
    """
    Factory Function สำหรับสร้าง Flask Application Instance
    
    ขั้นตอนการทำงาน:
    1. สร้าง Flask app โดยกำหนด static_folder เป็นโฟลเดอร์ frontend
    2. โหลด configuration จาก config_class
    3. เชื่อมต่อ database
    4. ตั้งค่า CORS สำหรับ development
    5. สร้างตารางใน database (ถ้ายังไม่มี)
    6. โหลดข้อมูลเริ่มต้น (ถ้าฐานข้อมูลว่าง)
    7. ลงทะเบียน blueprints ทั้งหมด
    8. กำหนด route สำหรับ health check, index และ SPA fallback
    """
    # สร้าง Flask instance โดยกำหนด static_folder เป็น frontend directory
    # ทำให้ Flask สามารถ serve ไฟล์ static และ HTML ได้โดยไม่ต้องใช้ Node.js
    app = Flask(
        __name__,
        static_folder=_FRONTEND_DIR,
        static_url_path="",
    )
    
    # โหลด configuration จาก class (มี Config, DevConfig, ProdConfig)
    app.config.from_object(config_class)

    # เริ่มต้น SQLAlchemy ORM โดยเชื่อมกับ Flask app
    db.init_app(app)
    
    # ตั้งค่า CORS (Cross-Origin Resource Sharing)
    # อนุญาตให้ frontend (localhost) เรียก API ได้
    # รองรับ credentials (cookies, sessions) สำหรับ authentication
    CORS(app, origins=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$", supports_credentials=True)

    # สร้าง application context เพื่อให้สามารถใช้งาน database ได้
    with app.app_context():
        # สร้างตารางทั้งหมดใน database (ถ้ายังไม่มี)
        db.create_all()
        # โหลดข้อมูลเริ่มต้น (admin account, หน่วยงานตัวอย่าง, โครงการตัวอย่าง)
        from .initial_data import load_if_empty
        load_if_empty()

    # ลงทะเบียน blueprints ทั้งหมด (API endpoints)
    register_blueprints(app)

    # Route สำหรับตรวจสอบสถานะ server
    @app.get("/api/health")
    def health_check():
        """Health check endpoint - ใช้สำหรับตรวจสอบว่า server ทำงานอยู่หรือไม่"""
        return jsonify(status="ok"), 200

    # Route หลัก - ให้บริการไฟล์ index.html
    # ทำให้สามารถใช้งาน Single Page Application (SPA) ได้โดยไม่ต้องใช้ Node.js
    @app.get("/")
    def index():
        """Root route - serve index.html สำหรับ SPA"""
        return send_from_directory(app.static_folder, "index.html")

    # Fallback route สำหรับ SPA
    # ถ้า path ไม่ใช่ API route ให้ส่ง index.html กลับไป
    # (client-side routing จะจัดการ path ต่อ)
    @app.get("/<path:path>")
    def serve_spa(path: str):
        """Serve SPA for non-API routes"""
        # ถ้าเป็น API route ให้ return 404
        if path.startswith("api/"):
            return jsonify(error="Not Found"), 404
        # ตรวจสอบว่าไฟล์มีอยู่จริงใน static folder หรือไม่
        full_path = os.path.join(app.static_folder, path)
        if os.path.isfile(full_path):
            # ถ้ามีไฟล์ ให้ส่งไฟล์นั้นกลับไป
            return send_from_directory(app.static_folder, path)
        # ถ้าไม่มี ให้ส่ง index.html (SPA จะ handle 404 เอง)
        return send_from_directory(app.static_folder, "index.html")

    return app


def register_blueprints(app: Flask) -> None:
    """
    ลงทะเบียน Flask Blueprints ทั้งหมด
    
    Blueprint คือวิธีการจัดกลุ่ม route แยกเป็น module
    แต่ละ blueprint จะมี url_prefix กำกับ
    
    หมายเหตุ: pin_bp ต้องลงทะเบียนก่อน org_bp 
    เพราะมี route /<org_id>/pin ที่ต้อง match ก่อน /<org_id> ทั่วไป
    """
    # Auth routes - จัดการ login, logout, session
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    
    # Dashboard routes - สถิติและข้อมูลสรุป
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    
    # Project routes - CRUD โครงการ
    app.register_blueprint(project_bp, url_prefix="/api/projects")
    
    # Report routes - ส่งออกข้อมูล (CSV)
    app.register_blueprint(report_bp, url_prefix="/api/projects")
    
    # PIN management routes - ต้องลงทะเบียนก่อน org_bp
    # เพราะมี route /<org_id>/pin ที่ต้องถูก match ก่อน /<org_id>
    app.register_blueprint(pin_bp, url_prefix="/api/orgs")
    
    # Organization routes - CRUD หน่วยงาน
    app.register_blueprint(org_bp, url_prefix="/api/orgs")
    
    # User routes - จัดการผู้ใช้ (สำหรับ admin)
    app.register_blueprint(user_bp, url_prefix="/api/users")
    
    # Audit routes - บันทึกประวัติการทำงาน
    app.register_blueprint(audit_bp, url_prefix="/api/audit-logs")
    
    # Data routes - ดึงข้อมูลทั้งหมดครั้งเดียว (สำหรับ frontend)
    app.register_blueprint(data_bp, url_prefix="/api/data")
