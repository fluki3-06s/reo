"""
Utils - ฟังก์ชันช่วยเหลือสำหรับ Routes

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้รวบรวมฟังก์ชันช่วยเหลือ (helper functions) ที่ใช้ร่วมกันใน routes ต่างๆ
เพื่อไม่ต้องเขียนโค้ดซ้ำกันหลายที่

================================================================================
ฟังก์ชัน:
================================================================================
1. get_current_user()     - ดึงข้อมูลผู้ใช้ปัจจุบันจาก session
2. get_current_username() - ดึง username ของผู้ใช้ปัจจุบัน
3. require_admin()        - ตรวจสอบว่าเป็น admin หรือไม่ (return 403 ถ้าไม่)
4. require_login()        - ตรวจสอบว่าล็อกอินหรือยัง (return 401 ถ้าไม่)
5. random_pin_6()         - สร้าง PIN 6 หลักแบบสุ่ม
6. generate_unique_org_pin() - สร้าง PIN สำหรับหน่วยงานที่ไม่ซ้ำกับที่มีอยู่
"""
from __future__ import annotations

import secrets

from flask import jsonify, session

from app.models import Org, User

# ข้อความ error สำหรับ unauthorized
ADMIN_ONLY_MSG = "เฉพาะผู้ดูแลระบบเท่านั้น"
LOGIN_REQUIRED_MSG = "กรุณาเข้าสู่ระบบ"


def get_current_user() -> User | None:
    """
    ดึงข้อมูลผู้ใช้ปัจจุบันจาก session
    
    อ่าน user_id จาก Flask session แล้ว query ข้อมูล User จาก database
    
    Returns:
        User object ถ้าล็อกอินแล้ว
        None ถ้ายังไม่ได้ล็อกอิน
    """
    # ดึง user_id จาก session
    # session เก็บข้อมูลผู้ใช้ที่ล็อกอินอยู่ (เหมือน cookie ฝั่ง server)
    user_id = session.get("user_id")
    
    # ถ้าไม่มี user_id ใน session แสดงว่ายังไม่ได้ล็อกอิน
    if not user_id:
        return None
    
    # Query ข้อมูล User จาก database
    # User.query.get(user_id) คือ SELECT * FROM users WHERE id = user_id
    return User.query.get(user_id)


def get_current_username() -> str:
    """
    ดึง username ของผู้ใช้ปัจจุบัน
    
    ใช้สำหรับบันทึกลง audit log เพื่อรู้ว่าใครทำการ
    
    Returns:
        username ของผู้ใช้
        "unknown" ถ้ายังไม่ได้ล็อกอิน
    """
    user = get_current_user()
    if user:
        return user.username
    return "unknown"


def require_admin() -> None | tuple:
    """
    ตรวจสอบว่าผู้ใช้ปัจจุบันเป็น admin หรือไม่
    
    ใช้เพื่อป้องกันไม่ให้ผู้ใช้ทั่วไปเข้าถึงฟังก์ชันที่ต้องการสิทธิ์ admin
    เช่น การสร้าง/ลบหน่วยงาน, การเปลี่ยน PIN ฯลฯ
    
    Returns:
        None ถ้าเป็น admin (ผ่านการตรวจสอบ, สามารถทำงานต่อได้)
        tuple (response, 403) ถ้าไม่ใช่ admin (ส่ง 403 Forbidden)
    
    วิธีใช้ใน route:
        @app.route("/admin-only")
        def admin_only():
            err = require_admin()
            if err:
                return err
            # ทำงานต่อไม่ได้ก็ไม่ต้องกลับมา
            return "Hello Admin!"
    """
    user = get_current_user()
    
    # ตรวจสอบ 2 ข้อ:
    # 1. ผู้ใช้ต้องล็อกอินอยู่ (user ไม่เป็น None)
    # 2. ผู้ใช้ต้องมี role = "admin"
    if not user or user.role != "admin":
        # ส่ง 403 Forbidden พร้อมข้อความ error
        return jsonify(message=ADMIN_ONLY_MSG), 403
    
    # ผ่านการตรวจสอบ ส่ง None กลับไป (ไม่ต้อง return error)
    return None


def require_login() -> None | tuple:
    """
    ตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือยัง
    
    ใช้เป็น middleware สำหรับ route ที่ต้องการให้ล็อกอินก่อนถึงเข้าถึงได้
    
    Returns:
        None ถ้าล็อกอินแล้ว (ผ่านการตรวจสอบ)
        tuple (response, 401) ถ้ายังไม่ได้ล็อกอิน
    
    วิธีใช้ใน route:
        @app.route("/protected")
        def protected():
            err = require_login()
            if err:
                return err
            return "Welcome!"
    """
    if not get_current_user():
        # ส่ง 401 Unauthorized พร้อมข้อความ error
        return jsonify(message=LOGIN_REQUIRED_MSG), 401
    return None


def random_pin_6() -> str:
    """
    สร้าง PIN 6 หลักแบบสุ่ม
    
    ใช้ secrets.randbelow() ซึ่งเป็น cryptographically secure
    (เหมาะสำหรับ generate password/pin ที่ต้องการความปลอดภัย)
    
    Returns:
        PIN 6 หลักในรูปแบบ string เช่น "123456", "847291"
        ค่าจะอยู่ระหว่าง 100000 - 999999 เสมอ
    """
    # secrets.randbelow(900000) สร้างค่าตั้งแต่ 0 ถึง 899999
    # บวก 100000 จะได้ค่าตั้งแต่ 100000 ถึง 999999
    # แปลงเป็น string เพื่อให้ได้ "123456" แทน 123456
    return str(secrets.randbelow(900000) + 100000)


def generate_unique_org_pin(existing: set[str] | None = None) -> str:
    """
    สร้าง PIN สำหรับหน่วยงานที่ไม่ซ้ำกับ PIN ที่มีอยู่
    
    แต่ละหน่วยงานต้องมี PIN ไม่ซ้ำกัน (เพราะใช้ PIN login)
    ฟังก์ชันนี้จะสุ่ม PIN ใหม่ไปเรื่อยๆ จนกว่าจะได้ PIN ที่ไม่ซ้ำ
    
    Args:
        existing: set ของ PIN ที่มีอยู่แล้ว (ถ้าไม่ใส่จะดึงจาก database)
    
    Returns:
        PIN 6 หลักที่ไม่ซ้ำกับที่มีอยู่
    
    Raises:
        ValueError: ถ้าสร้างไม่สำเร็จ (ลอง 1000 ครั้งแล้วซ้ำหมด)
    
    ตัวอย่าง:
        # สร้าง PIN ใหม่ที่ไม่ซ้ำกับที่มี
        new_pin = generate_unique_org_pin()
        
        # สร้าง PIN ใหม่ที่ไม่ซ้ำกับ PIN ที่กำหนด
        new_pin = generate_unique_org_pin({"123456", "654321"})
    """
    # ถ้าไม่ได้ส่ง existing มา ให้ดึงจาก database
    if existing is None:
        # Query หน่วยงานทั้งหมด แล้วดึง pin ที่ไม่เป็น None
        existing = {o.pin for o in Org.query.all() if o.pin}
    
    # ลองสุ่ม PIN ไปเรื่อยๆ จนกว่าจะได้ PIN ที่ไม่ซ้ำ
    # จำกัดไว้ที่ 1000 ครั้ง เพื่อป้องกัน infinite loop
    for _ in range(1000):
        pin = random_pin_6()
        if pin not in existing:
            return pin
    
    # ถ้าลอง 1000 ครั้งแล้วยังซ้ำหมด แสดงว่ามีปัญหา
    # (ฐานข้อมูลมี 1000 หน่วยงาน ซึ่งน่าจะเป็นไปไม่ได้)
    raise ValueError("ไม่สามารถสร้าง PIN ไม่ซ้ำได้")
