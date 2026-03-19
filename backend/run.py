"""
Entry Point - จุดเริ่มต้นการทำงานของระบบ

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้เป็นจุดเริ่มต้นการทำงานของระบบ (Entry Point)
เมื่อรันโค้ดนี้จะเริ่มต้น Flask development server

================================================================================
วิธีใช้:
================================================================================
1. Development (ใช้ Flask built-in server):
   python run.py
   
2. Production (ใช้ Gunicorn หรือ uWSGI):
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"

================================================================================
Environment Variables:
================================================================================
FLASK_ENV         - ตั้งค่า environment (development/production)
                    default: "development"
                    
FLASK_DEBUG       - เปิด debug mode
                    default: 1 (ใน development)
                    
SECRET_KEY        - Key สำหรับ sign session
ADMIN_PIN         - PIN ผู้ดูแลระบบ

================================================================================
Database:
================================================================================
Database จะถูกสร้างอัตโนมัติที่: backend/instance/sdg4.db
ถ้ายังไม่มีไฟล์ จะถูกสร้างใหม่พร้อม seed data
"""
from __future__ import annotations

# นำเข้า create_app function จาก app package
from app import create_app

# สร้าง Flask application instance
app = create_app()

# ถ้ารันไฟล์นี้โดยตรง (python run.py)
# Flask จะเริ่ม development server
if __name__ == "__main__":
    # แสดงข้อมูลเมื่อ start server
    print("=" * 60)
    print("SDG 4 Project Management System")
    print("=" * 60)
    print()
    print("Server starting at: http://localhost:5000")
    print()
    
    # ดึง admin PIN จาก config หรือ database
    admin_pin = app.config.get("_SEEDED_ADMIN_PIN")
    
    # ถ้าไม่มีใน config ให้ดึงจาก database
    if not admin_pin:
        with app.app_context():
            from app.models import User
            admin_user = User.query.filter_by(role="admin", active=True).first()
            if admin_user:
                admin_pin = admin_user.password
    
    # แสดง Admin PIN
    if admin_pin:
        print(f"Admin PIN: {admin_pin}")
    print()
    
    print("-" * 60)
    
    # เริ่ม Flask development server
    # debug=True ทำให้ server รีโหลดอัตโนมัติเมื่อมีการแก้ไขโค้ด
    # host='0.0.0.0' ทำให้เข้าถึงได้จากเครื่องอื่นในเครือข่าย
    app.run(debug=True, host="0.0.0.0", port=5000)
