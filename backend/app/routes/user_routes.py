"""
User Routes - จัดการผู้ใช้ระบบ

================================================================================
วัตถุประสงค์:
================================================================================
ไฟล์นี้จัดการเกี่ยวกับการจัดการผู้ใช้ระบบ
มี endpoints ดังนี้:

1. GET  /api/users/            - ดึงรายชื่อผู้ใช้ทั้งหมด (Admin only)
2. POST /api/users/            - สร้างผู้ใช้ใหม่ (placeholder)
3. PUT  /api/users/<id>        - แก้ไขข้อมูลผู้ใช้ (placeholder)
4. PUT  /api/users/<id>/password - เปลี่ยนรหัสผ่านผู้ใช้ (placeholder)

================================================================================
สถานะปัจจุบัน:
================================================================================
Endpoints สำหรับ POST, PUT เป็น placeholder ยังไม่ได้ implement
เนื่องจากระบบปัจจุบันใช้ PIN-based authentication
และผู้ใช้ (Manager) ถูกสร้างอัตโนมัติเมื่อสร้างหน่วยงาน

================================================================================
Authorization:
================================================================================
ทุก endpoints: เฉพาะ Admin เท่านั้น
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from app.models import User
from app.utils import require_admin

# สร้าง Blueprint สำหรับ user routes
user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["GET"])
def list_users():
    """
    ดึงรายชื่อผู้ใช้ทั้งหมด (Admin only)
    
    Method: GET
    URL: /api/users/
    Authorization: Admin เท่านั้น
    
    Response:
        HTTP 200
        {
            "items": [
                {
                    "id": "u-admin",
                    "username": "admin",
                    "role": "admin",
                    "orgId": null,
                    "active": true
                },
                {
                    "id": "u-mgr-org-001",
                    "username": "mgr-org-001",
                    "role": "manager",
                    "orgId": "org-001",
                    "active": true
                },
                ...
            ]
        }
    """
    # ตรวจสอบว่าเป็น admin หรือไม่
    err = require_admin()
    if err:
        return err

    # ดึงผู้ใช้ทั้งหมด เรียงตาม username
    users = User.query.order_by(User.username).all()
    
    # แปลงเป็น JSON format
    items = [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "orgId": u.org_id,
            "active": u.active,
        }
        for u in users
    ]
    
    return jsonify(items=items), 200


@user_bp.route("/", methods=["POST"])
def create_user():
    """
    สร้างผู้ใช้ใหม่ (Placeholder)
    
    Method: POST
    URL: /api/users/
    Authorization: Admin เท่านั้น
    
    หมายเหตุ: ยังไม่ได้ implement
    เนื่องจากระบบปัจจุบันสร้าง Manager อัตโนมัติเมื่อสร้าง Org
    
    Request Body: (ยังไม่รองรับ)
    
    Response: (placeholder)
        HTTP 201
        {
            "message": "create user placeholder",
            "payload": {...}
        }
    """
    payload = request.get_json(silent=True) or {}
    return jsonify(message="create user placeholder", payload=payload), 201


@user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id: int):
    """
    แก้ไขข้อมูลทั่วไปและบทบาทของผู้ใช้ (Placeholder)
    
    Method: PUT
    URL: /api/users/<user_id>
    Authorization: Admin เท่านั้น
    
    หมายเหตุ: ยังไม่ได้ implement
    
    Request Body: (ยังไม่รองรับ)
    
    Response: (placeholder)
        HTTP 200
        {
            "message": "update user placeholder",
            "user_id": ...,
            "payload": {...}
        }
    """
    payload = request.get_json(silent=True) or {}
    return jsonify(
        message="update user placeholder",
        user_id=user_id,
        payload=payload,
    ), 200


@user_bp.route("/<int:user_id>/password", methods=["PUT"])
def change_user_password(user_id: int):
    """
    เปลี่ยนรหัสผ่านของผู้ใช้ (Placeholder)
    
    Method: PUT
    URL: /api/users/<user_id>/password
    Authorization: Admin เท่านั้น
    
    หมายเหตุ: ยังไม่ได้ implement
    เนื่องจากระบบใช้ PIN ที่ถูกจัดการผ่าน Org PIN
    
    Request Body: (ยังไม่รองรับ)
    
    Response: (placeholder)
        HTTP 200
        {
            "message": "change user password placeholder",
            "user_id": ...,
            "payload": {...}
        }
    """
    payload = request.get_json(silent=True) or {}
    return jsonify(
        message="change user password placeholder",
        user_id=user_id,
        payload=payload,
    ), 200
