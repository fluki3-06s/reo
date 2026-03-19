/**
 * ================================================================================
 * API Client - ติดต่อ Backend API
 * ================================================================================
 * 
 * ไฟล์นี้เป็น API Client สำหรับติดต่อ Flask Backend
 * ใช้ Fetch API สำหรับ HTTP requests
 * 
 * ================================================================================
 * การออกแบบ:
 * ================================================================================
 * 
 * 1. Centralized API
 *    - ทุก API call ผ่าน object นี้
 *    - ง่ายต่อการ maintain และ debug
 * 
 * 2. Promise-based
 *    - ใช้ async/await
 *    - ง่ายต่อการใช้งาน
 * 
 * 3. Error Handling
 *    - ทุก method throw error เมื่อเกิดปัญหา
 *    - Error มี message ที่อ่านง่าย
 * 
 * ================================================================================
 * API Endpoints:
 * ================================================================================
 * 
 * Auth:
 * - api.me()              → GET  /api/auth/me
 * - api.login()           → POST /api/auth/login
 * - api.logout()          → POST /api/auth/logout
 * 
 * Organizations:
 * - api.getOrgsPublic()   → GET  /api/orgs/public
 * - api.createOrg()       → POST /api/orgs/
 * - api.updateOrg()       → PUT  /api/orgs/:id
 * - api.deleteOrg()       → DELETE /api/orgs/:id
 * - api.setOrgPin()       → PUT  /api/orgs/:id/pin
 * 
 * Projects:
 * - api.createProject()    → POST /api/projects/
 * - api.updateProject()    → PUT  /api/projects/:id
 * - api.deleteProject()    → DELETE /api/projects/:id
 * - api.uploadProjectImages() → POST /api/projects/:id/images
 * - api.deleteProjectImage() → DELETE /api/projects/:id/images/:imageId
 * 
 * Dashboard:
 * - api.getDashboardSummary() → GET  /api/dashboard/
 * - api.getDashboardByOrg()    → GET  /api/dashboard/by-org
 * - api.getDashboardBySdg()    → GET  /api/dashboard/by-sdg
 * 
 * Audit:
 * - api.getAuditLogs()    → GET  /api/audit/
 * 
 * Users:
 * - api.listUsers()       → GET  /api/users/
 * 
 * Report:
 * - api.downloadExportCsv() → GET  /api/report/export
 * 
 * Data:
 * - api.getFullData()     → GET  /api/data/full
 * 
 * ================================================================================
 */

const API_BASE = window.API_BASE || (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000'
    ? 'http://localhost:5000/api'
    : '/api'
);

// ================================================================================
// Helper: fetchOpts
// ================================================================================
// สร้าง options สำหรับ fetch request
// 
// Args:
//   method - HTTP method (GET, POST, PUT, DELETE)
//   body   - request body (ถ้ามี)
// 
// Returns:
//   object ที่เป็น options สำหรับ fetch
// ================================================================================
const fetchOpts = (method, body) => {
  const opts = {
    method,                                           // HTTP method
    headers: { 'Content-Type': 'application/json' }, // ส่ง JSON
    credentials: 'include',                           // ส่ง cookies (สำหรับ session)
  };
  if (body) opts.body = JSON.stringify(body);         // แปลง body เป็น JSON
  return opts;
};

// ================================================================================
// API Object
// ================================================================================
// รวม API methods ทั้งหมด
// ================================================================================
const api = {

  // ========================================================================
  // Auth APIs
  // ========================================================================
  
  /**
   * ตรวจสอบว่าล็อกอินอยู่หรือไม่
   * GET /api/auth/me
   * 
   * Returns:
   *   { user: {...}, session: {...} } ถ้าล็อกอินแล้ว
   *   { user: null } ถ้ายังไม่ล็อกอิน
   *   null ถ้าเกิด error
   */
  async me() {
    const r = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) return null;
    return data;
  },

  /**
   * เข้าสู่ระบบ
   * POST /api/auth/login
   * 
   * Args:
   *   orgId - รหัสหน่วยงาน ("admin" หรือ "org-001")
   *   pin   - PIN 6 หลัก
   * 
   * Returns:
   *   { session: {...}, message: "..." }
   * 
   * Throws:
   *   Error ถ้า PIN ไม่ถูกต้อง
   */
  async login(orgId, pin) {
    const r = await fetch(`${API_BASE}/auth/login`, fetchOpts('POST', { orgId, pin }));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
    return data;
  },

  /**
   * ออกจากระบบ
   * POST /api/auth/logout
   */
  async logout() {
    await fetch(`${API_BASE}/auth/logout`, fetchOpts('POST'));
  },

  // ========================================================================
  // Organization APIs
  // ========================================================================

  /**
   * ดึงรายชื่อหน่วยงานแบบสาธารณะ (ไม่รวม PIN)
   * GET /api/orgs/public
   * ใช้ได้ทั้งคนที่ล็อกอินแล้วและยังไม่ล็อกอิน
   * 
   * Returns:
   *   [{ id, name, active, projectCount }, ...]
   */
  async getOrgsPublic() {
    const r = await fetch(`${API_BASE}/orgs/public`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) return [];
    return data.items || [];
  },

  /**
   * ดึงข้อมูลทั้งหมดในระบบครั้งเดียว
   * GET /api/data/full
   * 
   * Returns:
   *   { orgs: [...], users: [...], projects: [...], audit: [...] }
   */
  async getFullData() {
    const r = await fetch(`${API_BASE}/data/full`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'โหลดข้อมูลไม่ได้');
    return data;
  },

  /**
   * สร้างหน่วยงานใหม่ (Admin only)
   * POST /api/orgs/
   */
  async createOrg(name) {
    const r = await fetch(`${API_BASE}/orgs`, fetchOpts('POST', { name }));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'เพิ่มหน่วยงานไม่สำเร็จ');
    return data.item;
  },

  /**
   * แก้ไขหน่วยงาน (Admin only)
   * PUT /api/orgs/:orgId
   */
  async updateOrg(orgId, body) {
    const r = await fetch(`${API_BASE}/orgs/${orgId}`, fetchOpts('PUT', body));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'อัปเดตไม่สำเร็จ');
    return data.item;
  },

  /**
   * ลบหน่วยงาน (Admin only)
   * DELETE /api/orgs/:orgId
   */
  async deleteOrg(orgId) {
    const r = await fetch(`${API_BASE}/orgs/${orgId}`, fetchOpts('DELETE'));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'ลบไม่สำเร็จ');
  },

  /**
   * ตั้ง PIN ใหม่ให้หน่วยงาน (Admin only)
   * PUT /api/orgs/:orgId/pin
   */
  async setOrgPin(orgId, pin) {
    const r = await fetch(`${API_BASE}/orgs/${orgId}/pin`, fetchOpts('PUT', { pin }));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'ตั้ง PIN ไม่สำเร็จ');
  },

  // ========================================================================
  // Project APIs
  // ========================================================================

  /**
   * สร้างโครงการใหม่
   * POST /api/projects/
   */
  async createProject(body) {
    const r = await fetch(`${API_BASE}/projects`, fetchOpts('POST', body));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'สร้างโครงการไม่สำเร็จ');
    return data.item;
  },

  /**
   * แก้ไขโครงการ
   * PUT /api/projects/:projectId
   */
  async updateProject(projectId, body) {
    const r = await fetch(`${API_BASE}/projects/${projectId}`, fetchOpts('PUT', body));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'อัปเดตไม่สำเร็จ');
    return data.item;
  },

  /**
   * ลบโครงการ
   * DELETE /api/projects/:projectId
   */
  async deleteProject(projectId) {
    const r = await fetch(`${API_BASE}/projects/${projectId}`, fetchOpts('DELETE'));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'ลบไม่สำเร็จ');
  },

  /**
   * อัปโหลดรูปภาพเพิ่มเติม
   * POST /api/projects/:projectId/images
   */
  async uploadProjectImages(projectId, images) {
    const r = await fetch(`${API_BASE}/projects/${projectId}/images`, fetchOpts('POST', { images }));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'อัปโหลดรูปไม่สำเร็จ');
    return data.item;
  },

  /**
   * ลบรูปภาพ
   * DELETE /api/projects/:projectId/images/:imageId
   */
  async deleteProjectImage(projectId, imageId) {
    const r = await fetch(`${API_BASE}/projects/${projectId}/images/${imageId}`, fetchOpts('DELETE'));
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'ลบรูปไม่สำเร็จ');
    return data.item;
  },

  // ========================================================================
  // Auth APIs
  // ========================================================================

  /**
   * ดึง Admin PIN (สำหรับระบบ Demo)
   * GET /api/auth/admin-pin
   */
  async getAdminPin() {
    const r = await fetch(`${API_BASE}/auth/admin-pin`);
    const data = await r.json();
    if (!r.ok) return null;
    return data.adminPin;
  },

  // ========================================================================
  // Dashboard APIs
  // ========================================================================

  /**
   * ดึงสถิติหลักสำหรับ Dashboard
   * GET /api/dashboard/summary
   */
  async getDashboardSummary() {
    const r = await fetch(`${API_BASE}/dashboard/summary`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'โหลดสรุปไม่สำเร็จ');
    return data;
  },

  /**
   * ดึงสถิติรายหน่วยงาน
   * GET /api/dashboard/by-org
   */
  async getDashboardByOrg() {
    const r = await fetch(`${API_BASE}/dashboard/by-org`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'โหลดข้อมูลตามหน่วยงานไม่สำเร็จ');
    return data.items || [];
  },

  /**
   * ดึงสถิติราย SDG Target
   * GET /api/dashboard/by-sdg
   */
  async getDashboardBySdg() {
    const r = await fetch(`${API_BASE}/dashboard/by-sdg`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'โหลดข้อมูลตาม SDG ไม่สำเร็จ');
    return data.items || [];
  },

  // ========================================================================
  // Audit APIs
  // ========================================================================

  /**
   * ดึงประวัติการทำงาน (Audit Logs)
   * GET /api/audit/
   * 
   * Args:
   *   params - { action?, by?, orgId?, projectId?, limit? }
   */
  async getAuditLogs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `${API_BASE}/audit-logs${qs ? '?' + qs : ''}`;
    const r = await fetch(url, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'โหลด Audit Log ไม่สำเร็จ');
    return data.items || [];
  },

  // ========================================================================
  // User APIs
  // ========================================================================

  /**
   * ดึงรายชื่อผู้ใช้ทั้งหมด (Admin only)
   * GET /api/users/
   */
  async listUsers() {
    const r = await fetch(`${API_BASE}/users/`, { credentials: 'include' });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'โหลดรายชื่อผู้ใช้ไม่สำเร็จ');
    return data.items || [];
  },

  // ========================================================================
  // Report APIs
  // ========================================================================

  /**
   * ดาวน์โหลด CSV
   * GET /api/projects/export
   * 
   * Args:
   *   params - { orgId?, year? }
   * 
   * จะดาวน์โหลดไฟล์โดยอัตโนมัติ
   */
  async downloadExportCsv(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = `${API_BASE}/projects/export${qs ? '?' + qs : ''}`;
    const r = await fetch(url, { credentials: 'include' });
    if (!r.ok) {
      const text = await r.text();
      let msg = 'ดาวน์โหลดไม่สำเร็จ';
      try { const d = JSON.parse(text); msg = d.message || msg; } catch (_) {}
      throw new Error(msg);
    }
    // ดาวน์โหลดไฟล์
    const blob = await r.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sdg4_projects_export.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

// ================================================================================
// refreshFromApi
// ================================================================================
// อัปเดต window.DB จาก API
// 
// ใช้เมื่อ:
// - หลังจากมีการแก้ไขข้อมูล (เพิ่ม/แก้ไข/ลบ)
// - ต้องการ sync ข้อมูลใหม่
// ================================================================================
async function refreshFromApi() {
  const full = await api.getFullData();
  window.DB = { orgs: full.orgs, users: full.users, projects: full.projects, audit: full.audit };
}

// Export to window
window.api = api;
window.refreshFromApi = refreshFromApi;
