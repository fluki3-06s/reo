"""
System Tests สำหรับระบบ SDG4 Admin Dashboard
ตามเอกสาร unit5.md บทที่ 5 การทดสอบระบบ (Testing)

รันด้วย: python -m pytest test.py -v
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import pytest
from app.database import db
from app.models import User, Org, Project, ProjectImage, AuditLog
from app.utils import random_pin_6, generate_unique_org_pin
from datetime import date


# ========================================
# Fixtures
# ========================================

@pytest.fixture(scope='function')
def app_base():
    """Fixture พื้นฐาน: Flask app สำหรับทดสอบ โดยไม่ผ่าน create_app เพื่อหลีกเลี่ยง seed data"""
    from flask import Flask
    from flask_cors import CORS
    from app.routes.auth_routes import auth_bp
    from app.routes.project_routes import project_bp
    from app.routes.report_routes import report_bp
    from app.routes.org_routes import org_bp
    from app.routes.pin_routes import pin_bp
    from app.routes.user_routes import user_bp
    from app.routes.audit_routes import audit_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.data_routes import data_bp

    class TestConfig:
        TESTING = True
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
        SECRET_KEY = 'test-secret-key'
        JSON_AS_ASCII = False

    app = Flask(__name__)
    app.config.from_object(TestConfig)

    db.init_app(app)
    CORS(app, supports_credentials=True)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(project_bp, url_prefix="/api/projects")
    app.register_blueprint(report_bp, url_prefix="/api/projects")
    app.register_blueprint(pin_bp, url_prefix="/api/orgs")
    app.register_blueprint(org_bp, url_prefix="/api/orgs")
    app.register_blueprint(user_bp, url_prefix="/api/users")
    app.register_blueprint(audit_bp, url_prefix="/api/audit-logs")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(data_bp, url_prefix="/api/data")

    return app


@pytest.fixture(scope='function')
def app_with_basic_data(app_base):
    """App พร้อมข้อมูลพื้นฐาน: admin, org1, org-disabled, manager1, project1"""
    with app_base.app_context():
        db.create_all()

        admin = User(id='admin-001', username='admin', password='123456', role='admin', active=True)
        org1 = Org(id='org-001', name='หน่วยงานทดสอบ 1', pin='654321', active=True)
        org_disabled = Org(id='org-disabled', name='หน่วยงานปิดใช้งาน', pin='111111', active=False)
        manager1 = User(id='mgr-001', username='mgr-org-001', password='654321',
                       role='manager', org_id='org-001', active=True)
        project1 = Project(
            id='p-001', org_id='org-001', title='โครงการทดสอบ 1', budget=100000,
            objective='วัตถุประสงค์ทดสอบ', policy='นโยบายทดสอบ', owner='ผู้รับผิดชอบ',
            year=2568, start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
            sdg=['4.1'], updated_by='admin'
        )

        db.session.add_all([admin, org1, org_disabled, manager1, project1])
        db.session.commit()

        yield app_base

        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def app_with_full_data(app_base):
    """App พร้อมข้อมูลเต็ม: admin, org1, org2, manager1, manager2, project1, project2, images"""
    with app_base.app_context():
        db.create_all()

        admin = User(id='admin-001', username='admin', password='123456', role='admin', active=True)
        org1 = Org(id='org-001', name='หน่วยงาน 1', pin='654321', active=True)
        org2 = Org(id='org-002', name='หน่วยงาน 2', pin='222222', active=True)
        manager1 = User(id='mgr-001', username='mgr-org-001', password='654321',
                       role='manager', org_id='org-001', active=True)
        manager2 = User(id='mgr-002', username='mgr-org-002', password='222222',
                       role='manager', org_id='org-002', active=True)

        project1 = Project(
            id='p-001', org_id='org-001', title='โครงการอนุรักษ์', budget=100000,
            objective='วัตถุประสงค์', policy='นโยบาย', owner='ผู้รับผิดชอบ',
            year=2568, start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
            sdg=['4.1'], updated_by='admin'
        )
        project2 = Project(
            id='p-002', org_id='org-002', title='โครงการพัฒนา', budget=50000,
            objective='วัตถุประสงค์', policy='นโยบาย', owner='ผู้รับผิดชอบ',
            year=2568, start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
            sdg=['4.2'], updated_by='admin'
        )

        img1 = ProjectImage(id='img-001', project_id='p-001', name='img1.jpg',
                           data_url='data:image/png;base64,test1')
        img2 = ProjectImage(id='img-002', project_id='p-001', name='img2.jpg',
                           data_url='data:image/png;base64,test2')
        img3 = ProjectImage(id='img-003', project_id='p-001', name='img3.jpg',
                           data_url='data:image/png;base64,test3')

        db.session.add_all([admin, org1, org2, manager1, manager2,
                          project1, project2, img1, img2, img3])
        db.session.commit()

        yield app_base

        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def client(app_with_basic_data):
    return app_with_basic_data.test_client()


@pytest.fixture(scope='function')
def client_full(app_with_full_data):
    return app_with_full_data.test_client()


# ========================================
# 5.2.1 การทดสอบ PIN Authentication
# ========================================

def test_ut01_invalid_pin_length(client):
    """UT-01: PIN ที่ไม่ใช่ตัวเลข 6 หลักต้องถูกปฏิเสธ"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '123'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'PIN ต้องเป็นตัวเลข 6 หลัก' in data['message']


def test_ut02_non_digit_pin(client):
    """UT-02: PIN ที่เป็นตัวอักษรต้องถูกปฏิเสธ"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': 'abcdef'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'PIN ต้องเป็นตัวเลข 6 หลัก' in data['message']


def test_ut03_correct_admin_pin(client):
    """UT-03: PIN ที่ถูกต้องสำหรับ Admin ต้องผ่าน"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '123456'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['session']['role'] == 'admin'


def test_ut04_wrong_admin_pin(client):
    """UT-04: PIN ที่ผิดสำหรับ Admin ต้องถูกปฏิเสธ"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '000000'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'รหัส PIN ของผู้ดูแลระบบไม่ถูกต้อง' in data['message']


def test_ut05_correct_manager_pin(client):
    """UT-05: PIN ที่ถูกต้องสำหรับ Manager ต้องผ่าน"""
    response = client.post('/api/auth/login', json={
        'orgId': 'org-001',
        'pin': '654321'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['session']['role'] == 'manager'
    assert data['session']['orgId'] == 'org-001'


def test_ut06_disabled_org_login(client):
    """UT-06: Manager login กับหน่วยงานที่ถูกปิดใช้งานต้องถูกปฏิเสธ"""
    response = client.post('/api/auth/login', json={
        'orgId': 'org-disabled',
        'pin': '111111'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'หน่วยงานถูกปิดใช้งาน' in data['message']


# ========================================
# 5.2.2 การทดสอบ Input Validation
# ========================================

def test_ut07_title_whitespace_only(client):
    """UT-07: title ที่เป็นช่องว่างล้วนต้องถือว่าว่างเปล่า"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    response = client.post('/api/projects/', json={
        'title': '   ',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุชื่อโครงการ' in data['message']


def test_ut08_title_with_text(client):
    """UT-08: title ที่มีตัวอักษรต้องผ่านการตรวจสอบ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    response = client.post('/api/projects/', json={
        'title': '  โครงการอนุรักษ์สิ่งแวดล้อม  ',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['title'] == 'โครงการอนุรักษ์สิ่งแวดล้อม'


def test_ut09_empty_title(client):
    """UT-09: ไม่กรอก title ต้องถูกปฏิเสธ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    response = client.post('/api/projects/', json={
        'title': '',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุชื่อโครงการ' in data['message']


def test_ut10_negative_budget(client):
    """UT-10: งบประมาณติดลบต้องถูกปฏิเสธ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    response = client.post('/api/projects/', json={
        'title': 'โครงการทดสอบ',
        'orgId': 'org-001',
        'budget': -1000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุงบประมาณให้ถูกต้อง' in data['message']


def test_ut11_end_date_before_start_date(client):
    """UT-11: วันที่สิ้นสุดก่อนวันเริ่มต้นต้องถูกปฏิเสธ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    response = client.post('/api/projects/', json={
        'title': 'โครงการทดสอบ',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2024-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น' in data['message']


def test_ut12_invalid_year(client):
    """UT-12: ปีงบประมาณนอกช่วงต้องถูกปฏิเสธ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    response = client.post('/api/projects/', json={
        'title': 'โครงการทดสอบ',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2000,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุปีงบประมาณให้ถูกต้อง' in data['message']


# ========================================
# 5.2.3 การทดสอบ Role Authorization
# ========================================

def test_ut13_not_logged_in(client):
    """UT-13: ผู้ใช้ที่ไม่ได้ล็อกอินเรียก API ต้องถูกปฏิเสธ"""
    response = client.get('/api/projects/')
    assert response.status_code == 401
    data = response.get_json()
    assert 'กรุณาเข้าสู่ระบบ' in data['message']


def test_ut14_manager_edit_other_org_project(client):
    """UT-14: Manager พยายามแก้ไขโครงการของหน่วยงานอื่นต้องถูกปฏิเสธ"""
    with client.application.app_context():
        org2 = Org(id='org-002', name='หน่วยงาน 2', pin='222222', active=True)
        manager2 = User(
            id='mgr-002', username='mgr-org-002', password='222222',
            role='manager', org_id='org-002', active=True
        )
        project2 = Project(
            id='p-002', org_id='org-002', title='โครงการหน่วยงาน 2', budget=50000,
            objective='วัตถุประสงค์', policy='นโยบาย', owner='ผู้รับผิดชอบ',
            year=2568, start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
            sdg=['4.2'], updated_by='admin'
        )
        db.session.add_all([org2, manager2, project2])
        db.session.commit()

    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client.put('/api/projects/p-002', json={'title': 'แก้ไขโครงการ'})
    assert response.status_code == 403
    data = response.get_json()
    assert 'ไม่มีสิทธิ์แก้ไขโครงการนี้' in data['message']


def test_ut15_manager_edit_own_org_project(client):
    """UT-15: Manager แก้ไขโครงการของหน่วยงานตัวเองต้องผ่าน"""
    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})

    # สร้างโครงการใหม่แล้วค่อยแก้ไข
    create_resp = client.post('/api/projects/', json={
        'title': 'โครงการทดสอบแก้ไข',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์ทดสอบ',
        'policy': 'นโยบายทดสอบ',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    project_id = create_resp.get_json()['item']['id']

    # แก้ไขโครงการที่สร้าง
    response = client.put(f'/api/projects/{project_id}', json={
        'title': 'แก้ไขสำเร็จ'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['item']['title'] == 'แก้ไขสำเร็จ'


def test_ut16_admin_edit_any_project(client):
    """UT-16: Admin แก้ไขโครงการได้ทุกหน่วยงาน"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    # สร้างโครงการใหม่แล้วค่อยแก้ไข
    create_resp = client.post('/api/projects/', json={
        'title': 'Admin จะแก้ไข',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์ทดสอบ',
        'policy': 'นโยบายทดสอบ',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    project_id = create_resp.get_json()['item']['id']

    response = client.put(f'/api/projects/{project_id}', json={
        'title': 'Admin แก้ไขโครงการ'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['item']['title'] == 'Admin แก้ไขโครงการ'


def test_ut17_manager_delete_other_org_project(client):
    """UT-17: Manager ลบโครงการของหน่วยงานอื่นต้องถูกปฏิเสธ"""
    with client.application.app_context():
        org3 = Org(id='org-003', name='หน่วยงาน 3', pin='333333', active=True)
        manager3 = User(
            id='mgr-003', username='mgr-org-003', password='333333',
            role='manager', org_id='org-003', active=True
        )
        project3 = Project(
            id='p-003', org_id='org-003', title='โครงการหน่วยงาน 3', budget=75000,
            objective='วัตถุประสงค์', policy='นโยบาย', owner='ผู้รับผิดชอบ',
            year=2568, start_date=date(2025, 1, 1), end_date=date(2025, 12, 31),
            sdg=['4.3'], updated_by='admin'
        )
        db.session.add_all([org3, manager3, project3])
        db.session.commit()

    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client.delete('/api/projects/p-003')
    assert response.status_code == 403
    data = response.get_json()
    assert 'ไม่มีสิทธิ์ลบโครงการนี้' in data['message']


# ========================================
# Utility Functions Tests
# ========================================

def test_random_pin_6():
    """ทดสอบฟังก์ชัน random_pin_6"""
    pin = random_pin_6()
    assert len(pin) == 6
    assert pin.isdigit()
    assert 100000 <= int(pin) <= 999999


def test_generate_unique_org_pin():
    """ทดสอบฟังก์ชัน generate_unique_org_pin"""
    existing = {'123456', '654321', '111111'}
    pin = generate_unique_org_pin(existing)
    assert len(pin) == 6
    assert pin.isdigit()
    assert pin not in existing


# ========================================
# 5.3.1 การทดสอบระบบล็อกอิน
# ========================================

def test_tc01_admin_login_success(client):
    """TC-01: ล็อกอิน Admin สำเร็จ"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '123456'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['session']['role'] == 'admin'
    assert 'เข้าสู่ระบบสำเร็จ' in data['message']


def test_tc02_manager_login_success(client):
    """TC-02: ล็อกอิน Manager สำเร็จ"""
    response = client.post('/api/auth/login', json={
        'orgId': 'org-001',
        'pin': '654321'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['session']['role'] == 'manager'
    assert data['session']['orgId'] == 'org-001'


def test_tc03_admin_wrong_pin(client):
    """TC-03: ล็อกอินด้วย PIN ผิด (Admin)"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '000000'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'รหัส PIN ของผู้ดูแลระบบไม่ถูกต้อง' in data['message']


def test_tc04_manager_wrong_pin(client):
    """TC-04: ล็อกอินด้วย PIN ผิด (Manager)"""
    response = client.post('/api/auth/login', json={
        'orgId': 'org-001',
        'pin': '000000'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'PIN ไม่ถูกต้อง' in data['message']


def test_tc05_pin_less_than_6_digits(client):
    """TC-05: ล็อกอินด้วย PIN ไม่ครบ 6 หลัก"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '12345'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'PIN ต้องเป็นตัวเลข 6 หลัก' in data['message']


def test_tc06_pin_with_letters(client):
    """TC-06: ล็อกอินด้วย PIN มีตัวอักษร"""
    response = client.post('/api/auth/login', json={
        'orgId': 'admin',
        'pin': '12abc6'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'PIN ต้องเป็นตัวเลข 6 หลัก' in data['message']


def test_tc07_disabled_org_login(client):
    """TC-07: ล็อกอินด้วยหน่วยงานที่ถูกปิด"""
    response = client.post('/api/auth/login', json={
        'orgId': 'org-disabled',
        'pin': '111111'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'หน่วยงานถูกปิดใช้งาน' in data['message']


def test_tc08_access_without_login(client):
    """TC-08: เข้าหน้าที่ต้องล็อกอินโดยไม่มี Session"""
    response = client.get('/api/projects/')
    assert response.status_code == 401
    data = response.get_json()
    assert 'กรุณาเข้าสู่ระบบ' in data['message']


# ========================================
# 5.3.2 การทดสอบจัดการหน่วยงาน
# ========================================

def test_tc09_admin_list_all_orgs(client):
    """TC-09: แสดงรายชื่อหน่วยงานทั้งหมด (เฉพาะ Admin)"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.get('/api/orgs/')
    assert response.status_code == 200
    data = response.get_json()
    assert 'items' in data
    assert len(data['items']) >= 1


def test_tc10_public_org_list(client):
    """TC-10: แสดงรายชื่อแบบสาธารณะ"""
    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client.get('/api/orgs/public')
    assert response.status_code == 200
    data = response.get_json()
    assert 'items' in data
    for org in data['items']:
        assert 'pin' not in org or org.get('pin') is None


def test_tc11_admin_create_org(client):
    """TC-11: Admin สร้างหน่วยงานใหม่"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/orgs/', json={
        'name': 'หน่วยงานใหม่'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert 'item' in data
    assert data['item']['name'] == 'หน่วยงานใหม่'


def test_tc12_admin_create_org_empty_name(client):
    """TC-12: Admin สร้างหน่วยงานแต่ทิ้งช่องว่างชื่อไว้"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/orgs/', json={
        'name': '   '
    })
    assert response.status_code == 400


def test_tc13_admin_update_org(client):
    """TC-13: Admin อัปเดตเปลี่ยนชื่อและปิดสถานะ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.put('/api/orgs/org-001', json={
        'name': 'ชื่อใหม่',
        'active': False
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['item']['name'] == 'ชื่อใหม่'
    assert data['item']['active'] == False


def test_tc14_admin_delete_org(client):
    """TC-14: Admin ลบหน่วยงาน (Cascade)"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    create_resp = client.post('/api/orgs/', json={'name': 'หน่วยงานจะลบ'})
    org_id = create_resp.get_json()['item']['id']
    response = client.delete(f'/api/orgs/{org_id}')
    assert response.status_code == 200


# ========================================
# 5.3.3 การทดสอบจัดการ PIN
# ========================================

def test_tc15_admin_change_org_pin(client):
    """TC-15: Admin เปลี่ยน PIN ของหน่วยงาน"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.put('/api/orgs/org-001/pin', json={
        'pin': '999999'
    })
    assert response.status_code == 200


def test_tc16_invalid_pin_format(client):
    """TC-16: ตั้ง PIN สั้นหรือมีตัวอักษร"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.put('/api/orgs/org-001/pin', json={
        'pin': 'abc'
    })
    assert response.status_code == 400


# ========================================
# 5.3.4 การทดสอบสร้างโครงการ
# ========================================

def test_tc18_admin_create_project_success(client):
    """TC-18: สร้างโครงการสำเร็จ (Admin)"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['title'] == 'โครงการ A'


def test_tc19_manager_create_project_success(client):
    """TC-19: สร้างโครงการสำเร็จ (Manager)"""
    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ B',
        'budget': 50000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.2'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['title'] == 'โครงการ B'


def test_tc20_empty_title(client):
    """TC-20: ไม่กรอก title"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': '',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุชื่อโครงการ' in data['message']


def test_tc21_whitespace_title(client):
    """TC-21: title เป็นช่องว่างล้วน"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': '   ',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400


def test_tc22_empty_objective(client):
    """TC-22: ไม่กรอก objective"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': '',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุวัตถุประสงค์' in data['message']


def test_tc23_empty_policy(client):
    """TC-23: ไม่กรอก policy"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': '',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุนโยบาย' in data['message']


def test_tc24_no_sdg_selected(client):
    """TC-24: ไม่เลือก SDG"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': [],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาเลือกอย่างน้อย 1 SDG Target' in data['message']


def test_tc25_less_than_3_images(client):
    """TC-25: อัปโหลดรูปน้อยกว่า 3 รูป"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาอัปโหลดรูปกิจกรรมอย่างน้อย 3 รูป' in data['message']


def test_tc26_more_than_4_images(client):
    """TC-26: อัปโหลดรูปเกิน 4 รูป"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'},
            {'id': 'img4', 'name': 'img4.jpg', 'dataUrl': 'data:image/png;base64,test4'},
            {'id': 'img5', 'name': 'img5.jpg', 'dataUrl': 'data:image/png;base64,test5'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'รูปภาพต้องไม่เกิน 4 รูป' in data['message']


def test_tc27_negative_budget(client):
    """TC-27: งบประมาณติดลบ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': -1000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'กรุณาระบุงบประมาณให้ถูกต้อง' in data['message']


def test_tc28_end_date_before_start_date(client):
    """TC-28: วันสิ้นสุดก่อนวันเริ่มต้น"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการ A',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-12-31',
        'endDate': '2025-01-01',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น' in data['message']


def test_tc29_check_timestamp(client):
    """TC-29: ตรวจสอบ Timestamp"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการทดสอบ Timestamp',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['createdAt'] is not None
    assert data['item']['updatedAt'] is not None


def test_tc30_manager_create_no_org_id(client):
    """TC-30: Manager สร้างโครงการไม่ระบุ orgId → ระบบใช้ org_id ของ Manager"""
    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการไม่ระบุ orgId',
        'budget': 50000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'},
        ]
    })
    # ไม่ส่ง orgId → ระบบใช้ org_id ของ Manager (org-001)
    assert response.status_code == 201
    assert response.get_json()['item']['orgId'] == 'org-001'


def test_tc31_check_audit_log(client):
    """TC-31: ตรวจสอบ Audit Log"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.post('/api/projects/', json={
        'title': 'โครงการทดสอบ Audit',
        'orgId': 'org-001',
        'budget': 100000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    assert response.status_code == 201

    with client.application.app_context():
        log = AuditLog.query.filter_by(action='create_project').first()
        assert log is not None
        assert log.by_username == 'admin'


# ========================================
# 5.3.5 การทดสอบรายการและการค้นหา
# ========================================

def test_tc32_admin_list_all_projects(client_full):
    """TC-32: Admin ดูรายการโครงการทั้งหมด"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['items']) >= 2


def test_tc33_manager_list_all_projects(client_full):
    """TC-33: Manager ดูรายการโครงการทั้งหมด"""
    client_full.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client_full.get('/api/projects/')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['items']) >= 1


def test_tc34_filter_by_org(client_full):
    """TC-34: กรองด้วยหน่วยงาน"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/?orgId=org-001')
    assert response.status_code == 200
    data = response.get_json()
    for item in data['items']:
        assert item['orgId'] == 'org-001'


def test_tc35_filter_by_year(client_full):
    """TC-35: กรองด้วยปีงบประมาณ"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/?year=2568')
    assert response.status_code == 200
    data = response.get_json()
    for item in data['items']:
        assert item['year'] == 2568


def test_tc36_filter_by_sdg(client_full):
    """TC-36: กรองด้วย SDG"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/?sdg=4.1')
    assert response.status_code == 200
    data = response.get_json()
    for item in data['items']:
        assert '4.1' in item['sdg']


def test_tc37_search_by_keyword(client_full):
    """TC-37: ค้นหาด้วย keyword"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/?search=อนุรักษ์')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['items']) >= 1
    assert 'อนุรักษ์' in data['items'][0]['title']


def test_tc38_search_no_results(client_full):
    """TC-38: ค้นหาที่ไม่พบผลลัพธ์"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/?search=xyzqwerty')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['items']) == 0


def test_tc39_multiple_filters(client_full):
    """TC-39: รวมกรองหลายเงื่อนไข"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/?orgId=org-001&year=2568&sdg=4.1')
    assert response.status_code == 200
    data = response.get_json()
    for item in data['items']:
        assert item['orgId'] == 'org-001'
        assert item['year'] == 2568
        assert '4.1' in item['sdg']


def test_tc40_sort_by_updated_at(client_full):
    """TC-40: เรียงลำดับตามวันที่แก้ไขล่าสุด"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/')
    assert response.status_code == 200
    data = response.get_json()
    if len(data['items']) > 0:
        assert 'updatedAt' in data['items'][0]


# ========================================
# 5.3.6 การทดสอบแก้ไขโครงการ
# ========================================

def test_tc41_admin_update_project(client_full):
    """TC-41: Admin แก้ไขโครงการสำเร็จ"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.put('/api/projects/p-001', json={
        'title': 'โครงการแก้ไขแล้ว'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['item']['title'] == 'โครงการแก้ไขแล้ว'


def test_tc42_manager_update_own_project(client_full):
    """TC-42: Manager แก้ไขโครงการของตัวเองสำเร็จ"""
    client_full.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client_full.put('/api/projects/p-001', json={
        'title': 'Manager แก้ไข'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['item']['title'] == 'Manager แก้ไข'


def test_tc43_manager_update_other_org_project(client_full):
    """TC-43: Manager แก้ไขโครงการของหน่วยงานอื่น"""
    client_full.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client_full.put('/api/projects/p-002', json={
        'title': 'พยายามแก้ไข'
    })
    assert response.status_code == 403
    data = response.get_json()
    assert 'ไม่มีสิทธิ์แก้ไขโครงการนี้' in data['message']


def test_tc44_update_empty_title(client_full):
    """TC-44: แก้ไข title เป็นค่าว่าง"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.put('/api/projects/p-001', json={
        'title': ''
    })
    assert response.status_code == 400


def test_tc45_update_whitespace_title(client_full):
    """TC-45: แก้ไข title เป็นช่องว่างล้วน"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.put('/api/projects/p-001', json={
        'title': '   '
    })
    assert response.status_code == 400


def test_tc46_check_updated_at(client_full):
    """TC-46: แก้ไขและตรวจสอบ updated_at"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})

    resp1 = client_full.get('/api/projects/p-001')
    old_updated = resp1.get_json()['item']['updatedAt']

    import time
    time.sleep(0.1)
    resp2 = client_full.put('/api/projects/p-001', json={'title': 'แก้ไขเพื่อเช็ค timestamp'})
    new_updated = resp2.get_json()['item']['updatedAt']

    assert new_updated >= old_updated


def test_tc47_update_check_audit_log(client_full):
    """TC-47: แก้ไขและตรวจสอบ Audit Log"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.put('/api/projects/p-001', json={'title': 'แก้ไขเพื่อเช็ค audit'})
    assert response.status_code == 200

    with client_full.application.app_context():
        log = AuditLog.query.filter_by(action='update_project', project_id='p-001').first()
        assert log is not None
        assert log.by_username == 'admin'


def test_tc48_update_images(client_full):
    """TC-48: อัปเดต images ของโครงการ"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.put('/api/projects/p-001', json={
        'images': [
            {'id': 'img-new1', 'name': 'new1.jpg', 'dataUrl': 'data:image/png;base64,new1'},
            {'id': 'img-new2', 'name': 'new2.jpg', 'dataUrl': 'data:image/png;base64,new2'},
            {'id': 'img-new3', 'name': 'new3.jpg', 'dataUrl': 'data:image/png;base64,new3'},
        ]
    })
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['item']['images']) == 3


# ========================================
# 5.3.7 การทดสอบลบโครงการ
# ========================================

def test_tc49_admin_delete_project(client):
    """TC-49: Admin ลบโครงการสำเร็จ"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    create_resp = client.post('/api/projects/', json={
        'title': 'โครงการจะลบ',
        'orgId': 'org-001',
        'budget': 10000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    project_id = create_resp.get_json()['item']['id']
    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 200


def test_tc50_manager_delete_own_project(client):
    """TC-50: Manager ลบโครงการของตัวเองสำเร็จ"""
    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    create_resp = client.post('/api/projects/', json={
        'title': 'โครงการ Manager จะลบ',
        'budget': 10000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    project_id = create_resp.get_json()['item']['id']
    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 200


def test_tc51_manager_delete_other_org_project(client_full):
    """TC-51: Manager ลบโครงการของหน่วยงานอื่น"""
    client_full.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client_full.delete('/api/projects/p-002')
    assert response.status_code == 403
    data = response.get_json()
    assert 'ไม่มีสิทธิ์ลบโครงการนี้' in data['message']


def test_tc52_delete_nonexistent_project(client):
    """TC-52: ลบโครงการที่ไม่มีอยู่"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.delete('/api/projects/not-exist')
    assert response.status_code == 404


def test_tc53_delete_check_audit_log(client):
    """TC-53: ลบโครงการและตรวจสอบ Audit Log"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    create_resp = client.post('/api/projects/', json={
        'title': 'โครงการจะลบเพื่อเช็ค audit',
        'orgId': 'org-001',
        'budget': 10000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img1', 'name': 'img1.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img2', 'name': 'img2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img3', 'name': 'img3.jpg', 'dataUrl': 'data:image/png;base64,test3'},
        ]
    })
    project_id = create_resp.get_json()['item']['id']
    project_title = create_resp.get_json()['item']['title']

    response = client.delete(f'/api/projects/{project_id}')
    assert response.status_code == 200

    with client.application.app_context():
        log = AuditLog.query.filter_by(action='delete_project', project_id=project_id).first()
        assert log is not None
        assert log.by_username == 'admin'
        assert log.project_title == project_title


# ========================================
# 5.3.8 การทดสอบหน้ารายละเอียดโครงการ
# ========================================

def test_tc54_admin_view_project_detail(client_full):
    """TC-54: Admin ดูรายละเอียดโครงการใดๆ"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/p-001')
    assert response.status_code == 200
    data = response.get_json()
    assert 'item' in data
    assert data['item']['id'] == 'p-001'


def test_tc55_manager_view_project_detail(client_full):
    """TC-55: Manager ดูรายละเอียดโครงการใดๆ"""
    client_full.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client_full.get('/api/projects/p-001')
    assert response.status_code == 200
    data = response.get_json()
    assert 'item' in data


def test_tc56_view_nonexistent_project(client):
    """TC-56: ดูโครงการที่ไม่มีอยู่"""
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client.get('/api/projects/not-exist')
    assert response.status_code == 404


def test_tc57_check_project_detail_complete(client_full):
    """TC-57: เปิดหน้ารายละเอียดและตรวจสอบข้อมูลครบถ้วน"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.get('/api/projects/p-001')
    assert response.status_code == 200
    data = response.get_json()
    item = data['item']

    required_fields = ['title', 'budget', 'objective', 'policy', 'owner',
                      'year', 'startDate', 'endDate', 'sdg', 'images',
                      'createdAt', 'updatedAt']
    for field in required_fields:
        assert field in item


# ========================================
# 5.3.9 การทดสอบจัดการรูปภาพ
# ========================================

def test_tc58_upload_additional_images(client_full):
    """TC-58: อัปโหลดรูปภาพเพิ่มเติม"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.post('/api/projects/p-001/images', json={
        'images': [
            {'id': 'img-new', 'name': 'new.jpg', 'dataUrl': 'data:image/png;base64,new'}
        ]
    })
    assert response.status_code == 201


def test_tc59_upload_exceed_limit(client_full):
    """TC-59: อัปโหลดรูปเกินขีดจำกัด"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.post('/api/projects/p-001/images', json={
        'images': [
            {'id': 'img-x', 'name': 'x.jpg', 'dataUrl': 'data:image/png;base64,x'},
            {'id': 'img-y', 'name': 'y.jpg', 'dataUrl': 'data:image/png;base64,y'}
        ]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'รูปภาพสูงสุด 4 รูป' in data['message']


def test_tc60_delete_image(client_full):
    """TC-60: ลบรูปภาพ"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.delete('/api/projects/p-001/images/img-001')
    assert response.status_code == 200


def test_tc61_delete_nonexistent_image(client_full):
    """TC-61: ลบรูปที่ไม่มีอยู่"""
    client_full.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    response = client_full.delete('/api/projects/p-001/images/not-exist')
    assert response.status_code == 404


def test_tc62_manager_delete_other_org_image(client):
    """TC-62: Manager ลบรูปโครงการหน่วยงานอื่น"""
    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    client.post('/api/auth/login', json={'orgId': 'admin', 'pin': '123456'})
    create_resp = client.post('/api/projects/', json={
        'title': 'โครงการ org-002',
        'orgId': 'org-002',
        'budget': 10000,
        'owner': 'ผู้รับผิดชอบ',
        'year': 2568,
        'startDate': '2025-01-01',
        'endDate': '2025-12-31',
        'objective': 'วัตถุประสงค์',
        'policy': 'นโยบาย',
        'sdg': ['4.1'],
        'images': [
            {'id': 'img-test', 'name': 'test.jpg', 'dataUrl': 'data:image/png;base64,test1'},
            {'id': 'img-test2', 'name': 'test2.jpg', 'dataUrl': 'data:image/png;base64,test2'},
            {'id': 'img-test3', 'name': 'test3.jpg', 'dataUrl': 'data:image/png;base64,test3'}
        ]
    })
    project_id = create_resp.get_json()['item']['id']

    client.post('/api/auth/login', json={'orgId': 'org-001', 'pin': '654321'})
    response = client.delete(f'/api/projects/{project_id}/images/img-test')
    assert response.status_code == 403


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
