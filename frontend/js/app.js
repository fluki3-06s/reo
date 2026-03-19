/**
 * ================================================================================
 * SDG 4 Project Management System - Main Application
 * ================================================================================
 * 
 * ไฟล์นี้เป็น Entry Point หลักของ Frontend Application
 * ทำหน้าที่เริ่มต้นการทำงานของระบบทั้งหมด
 * 
 * ================================================================================
 * การทำงานโดยรวม:
 * ================================================================================
 * 
 * 1. ตรวจสอบ Session
 *    - เรียก API /api/auth/me เพื่อดูว่าผู้ใช้ล็อกอินอยู่หรือไม่
 *    - ถ้าล็อกอินแล้ว → โหลดข้อมูลทั้งหมด (orgs, users, projects, audit)
 *    - ถ้ายังไม่ล็อกอิน → แสดงหน้า Login
 * 
 * 2. เก็บข้อมูลใน Memory
 *    - window.session = ข้อมูลผู้ใช้ปัจจุบัน (role, userId, orgId)
 *    - window.DB = ข้อมูลทั้งหมดในระบบ (orgs, users, projects, audit)
 *    - ใช้เก็บข้อมูลใน client-side memory เพื่อให้เข้าถึงได้เร็ว
 * 
 * 3. เริ่มต้น UI
 *    - ซ่อนหน้า Login แสดงหน้าหลัก
 *    - แสดงชื่อผู้ใช้/หน่วยงานใน Navigation Bar
 *    - แสดงเมนูตามสิทธิ์ (Admin vs Manager)
 *    - ไปยังหน้า Dashboard
 * 
 * ================================================================================
 * Global Variables:
 * ================================================================================
 * 
 * window.session - Session ของผู้ใช้ปัจจุบัน
 *   {
 *     role: "admin" | "manager",
 *     userId: "u-admin" | "u-mgr-org-001",
 *     orgId: null | "org-001"
 *   }
 * 
 * window.DB - ข้อมูลทั้งหมดในระบบ (Client-side Database)
 *   {
 *     orgs: [...],     // รายชื่อหน่วยงาน
 *     users: [...],    // รายชื่อผู้ใช้
 *     projects: [...], // โครงการทั้งหมด
 *     audit: [...]     // ประวัติการทำงาน (เฉพาะ admin)
 *   }
 * 
 * ================================================================================
 */

// ================================================================================
// ฟังก์ชัน: syncNavHeight
// ================================================================================
// จัดการความสูงของ Navigation Bar ให้สมดุลกับเนื้อหา
// 
// ทำไมต้องมี:
// - Navigation Bar อาจมีความสูงไม่คงที่ (ขึ้นกับขนาดหน้าจอ, ภาษา)
// - เราต้องการให้ CSS รู้ความสูงที่แน่นอนเพื่อจัด layout
// 
// วิธีทำ:
// 1. ดึงความสูงจริงของ Navigation Bar
// 2. กำหนด CSS Variable --nav-h ให้มีค่าเท่ากับความสูงนั้น
// 3. CSS อื่นๆ จะใช้ --nav-h ในการจัด layout
// ================================================================================
function syncNavHeight() {
  // ค้นหา Navigation Bar
  const nav = document.querySelector('.navbar-custom');
  if (!nav) return; // ถ้าไม่พบ nav ออกไปเลย

  // ดึงความสูงจริง (getBoundingClientRect จะได้ขนาดจริงบนหน้าจอ)
  // Math.max(56, ...) คือกำหนดความสูงขั้นต่ำ 56px
  const h = Math.max(56, nav.getBoundingClientRect().height || 0);

  // กำหนด CSS Variable
  // document.documentElement คือ <html> element
  // style.setProperty กำหนดค่า CSS Variable
  // Math.round(h) ปัดเศษเป็นจำนวนเต็ม
  document.documentElement.style.setProperty('--nav-h', `${Math.round(h)}px`);
}

// ================================================================================
// ฟังก์ชัน: initApp
// ================================================================================
// เริ่มต้น Application หลังจากล็อกอินสำเร็จ
// 
// ทำงานเมื่อ:
// - ผู้ใช้ล็อกอินแล้ว (มี session ถูกต้อง)
// 
// สิ่งที่ทำ:
// 1. สลับ UI: ซ่อน Login, แสดง Main App
// 2. ตั้งค่า Navigation Height
// 3. แสดงชื่อผู้ใช้/หน่วยงานใน Navbar
// 4. แสดงเมนูตามสิทธิ์
// 5. ไปยังหน้า Dashboard
// ================================================================================
function initApp() {
  // ซ่อนหน้า Login โดยเพิ่ม class 'hidden'
  document.getElementById('loginScreen').classList.add('hidden');
  
  // แสดงหน้าหลักโดยลบ class 'hidden' ออก
  document.getElementById('mainApp').classList.remove('hidden');

  // ตั้งค่า Navigation Height ให้ถูกต้อง
  syncNavHeight();
  
  // เพิ่ม Event Listener สำหรับ resize
  // เมื่อขนาดหน้าจอเปลี่ยน (หมุนมือถือ, resize window)
  // จะเรียก syncNavHeight() ใหม่ทันที
  window.addEventListener('resize', syncNavHeight);

  // แสดงชื่อผู้ใช้/หน่วยงานใน Navigation Bar
  // ถ้าเป็น Admin แสดง "Admin"
  // ถ้าเป็น Manager แสดงชื่อหน่วยงานที่สังกัด
  document.getElementById('userDisplay').textContent =
    session.role === 'admin'
      ? 'Admin'
      : `${getOrgName(session.orgId)}`;

  // เรนเดอร์เมนูตามสิทธิ์ของผู้ใช้ (Admin vs Manager)
  renderMenu();
  
  // นำทางไปยังหน้า Dashboard
  navigateTo('dashboard');
}

// ================================================================================
// Theme Configuration
// ================================================================================
// ตั้งค่า Theme ของระบบ
// 
// ปัจจุบัน: ใช้ Light Theme เท่านั้น
// - กำหนด data-theme="light" ใน <html>
// - ลบ theme ที่เก็บใน localStorage ออก (เผื่อเคยตั้งค่าไว้)
// ================================================================================
document.documentElement.setAttribute('data-theme', 'light');
try { localStorage.removeItem('sdg4_theme'); } catch {}

// ================================================================================
// ฟังก์ชัน: doInit (Async)
// ================================================================================
// ฟังก์ชันหลักในการเริ่มต้นระบบ
// 
// ทำงานเมื่อหน้าเว็บโหลดเสร็จ
// 
// Flow:
// 1. ลองเรียก api.me() เพื่อตรวจสอบว่าล็อกอินหรือยัง
//    - ถ้ามี session → โหลดข้อมูลเต็ม + initApp()
//    - ถ้าไม่มี session → แสดงหน้า Login
// 
// 2. กรณีเกิด error (เช่น server ปิด)
//    - ใช้ local DB ว่างเปล่า + แสดง Login
// ================================================================================
async function doInit() {
  try {
    // เรียก API /api/auth/me เพื่อตรวจสอบ session
    const me = await api.me();
    
    // ถ้าได้ response ที่ถูกต้อง (มี session)
    if (me && me.session) {
      // เก็บ session ไว้ใน window.session
      window.session = me.session;
      
      // เรียก API /api/data/full เพื่อดึงข้อมูลทั้งหมด
      const full = await api.getFullData();
      
      // เก็บข้อมูลไว้ใน window.DB
      // เป็น "Client-side Database" ที่ทุกหน้าจะเข้าถึงได้
      window.DB = { 
        orgs: full.orgs, 
        users: full.users, 
        projects: full.projects, 
        audit: full.audit 
      };
      
      // เริ่มต้น Application (แสดงหน้าหลัก)
      initApp();
      return; // ออกจาก function
    }
    
    // กรณีไม่มี session (ยังไม่ล็อกอิน)
    // เรียก api.getOrgsPublic() เพื่อดึงรายชื่อหน่วยงาน
    // (ใช้แสดงในหน้า Login ให้เลือก)
    const orgs = await api.getOrgsPublic();
    window.DB = { orgs: orgs || [], users: [], projects: [], audit: [] };
    
  } catch (e) {
    // กรณีเกิด error (เช่น server ตอบกลับมาผิดพลาด, network error)
    console.warn('API init failed, using login screen', e);
    
    // ใช้ DB ว่างเปล่า (เพื่อไม่ให้ error ต่อ)
    window.DB = window.DB || { orgs: [], users: [], projects: [], audit: [] };
  }
  
  // แสดงหน้า Login
  initLogin();
}

// ================================================================================
// เริ่มต้นการทำงาน
// ================================================================================
// เรียก doInit() ทันทีเมื่อไฟล์นี้ถูกโหลด
// 
// หมายเหตุ:
// - doInit() เป็น async function
// - แต่เราไม่ใช้ await เพราะไม่จำเป็นต้องรอ
// - การทำงานจะดำเนินต่อไปโดยไม่รอ response
// ================================================================================
doInit();
