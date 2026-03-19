/**
 * ================================================================================
 * Router - ระบบนำทางหน้า (Client-Side Routing)
 * ================================================================================
 * 
 * ไฟล์นี้จัดการการนำทาง (Routing) ภายใน Single Page Application
 * 
 * ================================================================================
 * การทำงาน:
 * ================================================================================
 * 
 * เมื่อผู้ใช้คลิกเมนู:
 * 1. อัปเดต state currentPage
 * 2. เรนเดอร์เมนูใหม่ (ให้ active class)
 * 3. เรียก render function ของหน้านั้น
 * 4. แสดงผลใน #pageContent
 * 
 * ================================================================================
 * Pages ที่มี:
 * ================================================================================
 * 
 * Admin Menu:
 * - dashboard          → renderDashboard()
 * - organizations      → renderOrganizations()    (จัดการหน่วยงาน)
 * - users              → renderUsers()           (ตั้งค่า PIN)
 * - projects           → renderProjects()         (จัดการโครงการ)
 * - audit-log          → renderAuditLog()        (ประวัติการทำงาน)
 * 
 * Manager Menu:
 * - dashboard          → renderDashboard()
 * - projects-all       → renderProjectsAll()      (ดูโครงการทั้งหมด)
 * - projects           → renderProjects()         (จัดการโครงการของตัวเอง)
 * - organizations-view → renderOrganizationsView() (ดูรายชื่อหน่วยงาน)
 * 
 * ================================================================================
 */

// ================================================================================
// Global State
// ================================================================================
// หน้าปัจจุบันที่กำลังแสดง
// ใช้สำหรับ track ว่าผู้ใช้อยู่หน้าไหน
// ================================================================================
let currentPage = 'dashboard';

// ================================================================================
// ฟังก์ชัน: renderMenu
// ================================================================================
// สร้างและแสดงเมนูตามสิทธิ์ของผู้ใช้
// 
// Logic:
// - ถ้า role === 'admin' → แสดงเมนู Admin
// - ถ้า role === 'manager' → แสดงเมนู Manager
// 
// หมายเหตุ:
// - เมนูจะถูกสร้างใหม่ทุกครั้งที่มีการนำทาง
// - เพื่อให้ active class ถูกต้อง
// ================================================================================
function renderMenu() {
  // ค้นหา element ที่จะแสดงเมนู
  const menu = document.getElementById('mainMenu');
  const items = [];

  // ========================================================================
  // Admin Menu
  // ========================================================================
  // Admin มีสิทธิ์เข้าถึงทุกหน้า:
  // - Dashboard: แสดงสถิติ
  // - จัดการหน่วยงาน: CRUD หน่วยงาน
  // - ตั้งค่า PIN: เปลี่ยน PIN หน่วยงาน
  // - จัดการโครงการ: CRUD โครงการ
  // - Audit Log: ดูประวัติการทำงาน
  // ========================================================================
  if (session.role === 'admin') {
    items.push(
      { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
      { id: 'organizations', icon: 'fa-building', label: 'จัดการหน่วยงาน' },
      { id: 'users', icon: 'fa-key', label: 'ตั้งค่า PIN หน่วยงาน' },
      { id: 'projects', icon: 'fa-tasks', label: 'จัดการโครงการ' },
      { id: 'audit-log', icon: 'fa-list-alt', label: 'Audit Log' }
    );
  } 
  // ========================================================================
  // Manager Menu
  // ========================================================================
  // Manager มีสิทธิ์จำกัด:
  // - Dashboard: แสดงสถิติ
  // - โครงการทั้งหมด: ดูโครงการทุกหน่วยงาน (อ่านอย่างเดียว)
  // - จัดการโครงการ: CRUD โครงการของหน่วยงานตัวเองเท่านั้น
  // - หน่วยงานทั้งหมด: ดูรายชื่อหน่วยงาน (อ่านอย่างเดียว)
  // ========================================================================
  else {
    items.push(
      { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
      { id: 'projects-all', icon: 'fa-globe', label: 'โครงการทั้งหมด' },
      { id: 'projects', icon: 'fa-tasks', label: 'จัดการโครงการ' },
      { id: 'organizations-view', icon: 'fa-building', label: 'หน่วยงานทั้งหมด' }
    );
  }

  // ========================================================================
  // สร้าง HTML สำหรับเมนู
  // ========================================================================
  // ใช้ map + join เพื่อสร้าง list items
  // - ถ้าหน้าปัจจุบัน === item.id → เพิ่ม class 'active'
  // - ใช้ FontAwesome icons (fa-chart-line, fa-building ฯลฯ)
  // ========================================================================
  menu.innerHTML = items.map(item => `
    <li class="${currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
      <a>
        <i class="fas ${item.icon}"></i>
        ${item.label}
      </a>
    </li>
  `).join('');

  // ========================================================================
  // เพิ่ม Event Listeners สำหรับเมนู items
  // ========================================================================
  // เมื่อคลิกเมนู:
  // 1. ดึง page id จาก data-page attribute
  // 2. เรียก navigateTo(page)
  // 3. ถ้าหน้าจอเล็ก (< 1024px) → ปิด sidebar
  // ========================================================================
  menu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const page = li.getAttribute('data-page');
      navigateTo(page);
      
      // ปิด sidebar บนมือถือ/แท็บเล็ต
      const sidebarToggle = document.getElementById('sidebar-toggle');
      if (sidebarToggle && window.innerWidth < 1024) {
        sidebarToggle.checked = false;
      }
    });
  });
}

// ================================================================================
// ฟังก์ชัน: navigateTo
// ================================================================================
// นำทางไปยังหน้าที่ระบุ
// 
// ทำงาน:
// 1. อัปเดต currentPage state
// 2. เรนเดอร์เมนูใหม่ (ให้ active class ถูกต้อง)
// 3. เรียก render function ของหน้านั้น
// 
// หมายเหตุ:
// - ทุกหน้าจะถูกแสดงใน #pageContent
// - การเรนเดอร์เมนูใหม่ทำให้ active class ถูกต้อง
// ================================================================================
function navigateTo(page) {
  // อัปเดต state
  currentPage = page;
  
  // เรนเดอร์เมนูใหม่ (ให้ active class ถูกต้อง)
  renderMenu();

  // ค้นหา element ที่จะแสดงเนื้อหา
  const content = document.getElementById('pageContent');

  // ========================================================================
  // Switch ตาม page id และเรียก render function ที่เหมาะสม
  // ========================================================================
  switch(page) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'organizations':
      renderOrganizations();
      break;
    case 'organizations-view':
      renderOrganizationsView();
      break;
    case 'users':
      renderUsers();
      break;
    case 'projects-all':
      renderProjectsAll();
      break;
    case 'projects':
      renderProjects();
      break;
    case 'new-project':
      // ไปที่หน้า projects ก่อน แล้วเปิด modal สร้างโครงการใหม่
      renderProjects();
      break;
    case 'audit-log':
      renderAuditLog();
      break;
    default:
      // ถ้าไม่ตรงกับ case ไหนเลย → แสดง 404
      render404();
  }
}

// ================================================================================
// ฟังก์ชัน: render404
// ================================================================================
// แสดงหน้า 404 Not Found
// 
// ใช้เมื่อ:
// - page id ไม่ตรงกับ case ไหนเลย
// - หน้าที่ต้องการไม่มีอยู่จริง
// ================================================================================
function render404() {
  // อัปเดต state
  currentPage = '404';
  
  // ค้นหา element ที่จะแสดงเนื้อหา
  const content = document.getElementById('pageContent');
  if (!content) return; // ถ้าไม่พบ element ออกไป
  
  // แสดง 404 page
  // - ไอคอนเตือน
  // - ข้อความ "ไม่พบหน้านี้"
  // - ปุ่มกลับไป Dashboard
  content.innerHTML = `
    <div class="page flex flex-col items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md">
        <div class="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
          <i class="fas fa-exclamation-triangle text-5xl"></i>
        </div>
        <h1 class="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <p class="text-xl text-gray-600 mb-2">ไม่พบหน้านี้</p>
        <p class="text-gray-500 text-sm mb-8">หน้าที่คุณค้นหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่จริง</p>
        <button onclick="navigateTo('dashboard')" class="btn btn-primary gap-2 bg-blue-600 hover:bg-blue-700 border-0">
          <i class="fas fa-home"></i>
          กลับไป Dashboard
        </button>
      </div>
    </div>
  `;
}
