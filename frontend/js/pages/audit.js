/**
 * ================================================================================
 * Audit Log Page - หน้าประวัติการทำงาน (Admin)
 * ================================================================================
 * 
 * ไฟล์นี้จัดการหน้าประวัติการทำงาน (Audit Logs)
 * 
 * ================================================================================
 * Audit Log คืออะไร:
 * ================================================================================
 * 
 * Audit Log คือบันทึกการทำงานทุกอย่างในระบบ
 * ใช้สำหรับติดตามว่าใครทำอะไร เมื่อไหร่
 * 
 * ตัวอย่าง:
 * - "admin สร้างโครงการ: โครงการพัฒนาทักษะดิจิทัล"
 * - "mgr-org-001 อัปโหลดรูป 3 รูป"
 * - "admin เปลี่ยน PIN หน่วยงาน สพป.นม.1"
 * 
 * ================================================================================
 * Constants:
 * ================================================================================
 * 
 * - AUDIT_ACTION_LABELS  - ชื่อประเภทการกระทำภาษาไทย
 * - AUDIT_ACTION_COLORS  - สีของ badge ตามประเภทการกระทำ
 * 
 * ================================================================================
 * ฟังก์ชัน:
 * ================================================================================
 * 
 * - renderAuditLog()     - แสดงหน้าประวัติการทำงาน
 * - filterAuditLogs()   - กรองประวัติตามเงื่อนไข
 * - formatAuditTime()   - จัดรูปแบบเวลา
 * 
 * ================================================================================
 * สิทธิ์การเข้าถึง:
 * ================================================================================
 * 
 * - Admin: เห็นประวัติการทำงานทั้งหมด
 * - Manager: ไม่สามารถเข้าถึงได้
 * 
 * ================================================================================
 */

// ==================== Audit Log Page (Admin) ====================
const AUDIT_ACTION_LABELS = {
  'create_project': 'สร้างโครงการ',
  'create_org': 'สร้างหน่วยงาน',
  'update_project': 'แก้ไขโครงการ',
  'update_org': 'แก้ไขหน่วยงาน',
  'delete_project': 'ลบโครงการ',
  'upload_image': 'อัปโหลดรูป',
  'delete_image': 'ลบรูป',
  'delete_org': 'ลบหน่วยงาน',
  'set_org_pin': 'ตั้ง PIN หน่วยงาน',
  'change_admin_password': 'เปลี่ยนรหัสผ่าน Admin'
};

const AUDIT_ACTION_COLORS = {
  'create_project': 'badge-success',
  'create_org': 'badge-success',
  'update_project': 'badge-info',
  'update_org': 'badge-info',
  'delete_project': 'badge-error',
  'upload_image': 'badge-success',
  'delete_image': 'badge-warning',
  'delete_org': 'badge-error',
  'set_org_pin': 'badge-info',
  'change_admin_password': 'badge-info'
};

const BADGE_BG_MAP = {
  'badge-success': 'var(--badge-success-bg)',
  'badge-info': 'var(--badge-info-bg)',
  'badge-error': 'var(--badge-error-bg)',
  'badge-warning': 'var(--badge-warning-bg)',
  'badge-neutral': 'var(--badge-neutral-bg)'
};

const BADGE_TEXT_MAP = {
  'badge-success': 'var(--badge-success-text)',
  'badge-info': 'var(--badge-info-text)',
  'badge-error': 'var(--badge-error-text)',
  'badge-warning': 'var(--badge-warning-text)',
  'badge-neutral': 'var(--badge-neutral-text)'
};

async function renderAuditLog() {
  const content = document.getElementById('pageContent');
  if (session?.role !== 'admin') {
    content.innerHTML = '<div class="page"><div class="stat-card"><div class="alert alert-error"><i class="fas fa-ban"></i><span>เฉพาะผู้ดูแลระบบเท่านั้น</span></div></div></div>';
    return;
  }

  content.innerHTML = '<div class="page flex items-center justify-center min-h-[200px]"><span class="loading loading-spinner loading-lg text-primary"></span></div>';

  let auditLogs = [];
  try {
    auditLogs = await api.getAuditLogs({});
  } catch (e) {
    content.innerHTML = `<div class="page"><div class="alert alert-error">${e.message || 'โหลด Audit Log ไม่สำเร็จ'}</div></div>`;
    return;
  }

  const allUsers = [...new Set(auditLogs.map(log => log.by).filter(Boolean))].sort();

  content.innerHTML = `
    <div class="page">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">Audit Log</h1>
          <p class="text-gray-500 mt-2">ดูประวัติการทำงานทั้งหมด</p>
        </div>
        <div class="text-sm text-gray-500 whitespace-nowrap">
          รวมทั้งหมด: <strong id="auditTotalCount">${auditLogs.length}</strong> รายการ
        </div>
      </div>

      <div class="stat-card mb-6 filter-sticky">
        <details class="lg:hidden">
          <summary class="cursor-pointer btn btn-outline btn-sm w-full justify-between mb-4">
            <span><i class="fas fa-filter mr-2"></i>ตัวกรอง</span>
            <i class="fas fa-chevron-down transition-transform"></i>
          </summary>
          <div class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">ตั้งแต่เวลา</label>
                <input type="datetime-local" id="auditFilterFrom" class="input input-bordered w-full" onchange="filterAuditLog(event)" oninput="filterAuditLog(event)">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">กรองการกระทำ</label>
                <select id="auditFilterAction" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                  <option value="">ทั้งหมด</option>
                  ${Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">กรองผู้กระทำ</label>
                <select id="auditFilterBy" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                  <option value="">ทั้งหมด</option>
                  ${allUsers.map(user => `<option value="${user}">${getDisplayNameFromUsername(user)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">เรียงลำดับ</label>
                <select id="auditSortOrder" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                  <option value="newest" selected>ใหม่ล่าสุดก่อน</option>
                  <option value="oldest">เก่าที่สุดก่อน</option>
                </select>
              </div>
              <div class="flex items-end md:col-span-2">
                <button onclick="clearAuditFilters()" class="btn btn-outline btn-sm w-full whitespace-nowrap">
                  <span class="hidden sm:inline">ล้างตัวกรอง</span>
                  <span class="sm:hidden">ล้าง</span>
                </button>
              </div>
            </div>
          </div>
        </details>

        <div class="hidden lg:block">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">ตั้งแต่เวลา</label>
              <input type="datetime-local" id="auditFilterFrom" class="input input-bordered w-full" onchange="filterAuditLog(event)" oninput="filterAuditLog(event)">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">กรองการกระทำ</label>
              <select id="auditFilterAction" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                <option value="">ทั้งหมด</option>
                ${Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => `<option value="${key}">${label}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">กรองผู้กระทำ</label>
              <select id="auditFilterBy" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                <option value="">ทั้งหมด</option>
                ${allUsers.map(user => `<option value="${user}">${user}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">เรียงลำดับ</label>
              <select id="auditSortOrder" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                <option value="newest" selected>ใหม่ล่าสุดก่อน</option>
                <option value="oldest">เก่าที่สุดก่อน</option>
              </select>
            </div>
            <div class="flex items-end">
              <button onclick="clearAuditFilters()" class="btn btn-outline btn-sm w-full whitespace-nowrap">
                <span class="hidden sm:inline">ล้างตัวกรอง</span>
                <span class="sm:hidden">ล้าง</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="overflow-x-auto">
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th class="whitespace-nowrap min-w-[150px]">เวลา</th>
                <th class="whitespace-nowrap">ผู้กระทำ</th>
                <th class="whitespace-nowrap">การกระทำ</th>
                <th class="min-w-[150px]">โครงการ/หน่วยงาน</th>
                <th class="min-w-[200px]">รายละเอียด</th>
              </tr>
            </thead>
            <tbody id="auditLogTableBody">
              ${auditLogs.length === 0 ? `
                <tr>
                  <td colspan="5" class="text-center py-8 text-gray-500">ยังไม่มีประวัติการทำงาน</td>
                </tr>
              ` : auditLogs.map(log => {
                const date = new Date(log.at);
                const timeStr = date.toLocaleString('th-TH', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
                const actionLabel = AUDIT_ACTION_LABELS[log.action] || log.action;
                const actionColor = AUDIT_ACTION_COLORS[log.action] || 'badge-neutral';
                const bgColor = BADGE_BG_MAP[actionColor] || 'var(--badge-neutral-bg)';
                const textColor = BADGE_TEXT_MAP[actionColor] || 'var(--badge-neutral-text)';
                const projectTitle = log.projectTitle ? `<div class="font-medium">${log.projectTitle}</div>` : '';
                const orgName = log.orgId ? `<div class="text-xs text-gray-500">${getOrgName(log.orgId)}</div>` : '';
                return `
                  <tr>
                    <td class="text-sm whitespace-nowrap">${timeStr}</td>
                    <td class="font-medium whitespace-nowrap">${getDisplayNameFromUsername(log.by)}</td>
                    <td>
                      <span class="badge-inline" style="background-color: ${bgColor}; color: ${textColor};">${actionLabel}</span>
                    </td>
                    <td>${projectTitle}${orgName}</td>
                    <td class="text-sm text-gray-600">${log.details || '-'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  window.allAuditLogs = auditLogs;
  filterAuditLog();
}

function filterAuditLog(event) {
  const getVisibleElement = (id) => {
    const elements = document.querySelectorAll(`#${id}`);
    if (elements.length === 0) return null;
    if (elements.length === 1) return elements[0];
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' &&
          rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
        return el;
      }
    }
    return elements[0];
  };

  let fromInput, actionSelect, bySelect, sortSelect;
  if (event && event.target) {
    const targetId = event.target.id;
    if (targetId === 'auditFilterFrom') fromInput = event.target;
    else if (targetId === 'auditFilterAction') actionSelect = event.target;
    else if (targetId === 'auditFilterBy') bySelect = event.target;
    else if (targetId === 'auditSortOrder') sortSelect = event.target;
  }

  if (!fromInput) fromInput = getVisibleElement('auditFilterFrom');
  if (!actionSelect) actionSelect = getVisibleElement('auditFilterAction');
  if (!bySelect) bySelect = getVisibleElement('auditFilterBy');
  if (!sortSelect) sortSelect = getVisibleElement('auditSortOrder');

  const actionFilter = actionSelect?.value || '';
  const byFilter = bySelect?.value || '';
  const sortOrder = sortSelect?.value || 'newest';
  const fromValue = fromInput?.value || '';

  let filtered = (window.allAuditLogs || []).slice();

  if (fromValue) {
    const fromDate = new Date(fromValue).getTime();
    filtered = filtered.filter(log => {
      const logTime = typeof log.at === 'number' ? log.at : new Date(log.at).getTime();
      return logTime >= fromDate;
    });
  }
  if (actionFilter) filtered = filtered.filter(log => log.action === actionFilter);
  if (byFilter) filtered = filtered.filter(log => log.by === byFilter);

  if (sortOrder === 'newest' || sortOrder === '') {
    filtered.sort((a, b) => {
      const aTime = typeof a.at === 'number' ? a.at : new Date(a.at).getTime();
      const bTime = typeof b.at === 'number' ? b.at : new Date(b.at).getTime();
      return bTime - aTime;
    });
  } else if (sortOrder === 'oldest') {
    filtered.sort((a, b) => {
      const aTime = typeof a.at === 'number' ? a.at : new Date(a.at).getTime();
      const bTime = typeof b.at === 'number' ? b.at : new Date(b.at).getTime();
      return aTime - bTime;
    });
  }

  const countEl = document.getElementById('auditTotalCount');
  if (countEl) countEl.textContent = filtered.length;

  const tbody = document.getElementById('auditLogTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-gray-500">ไม่พบข้อมูลตามเงื่อนไขที่กรอง</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(log => {
    const date = new Date(log.at);
    const timeStr = date.toLocaleString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const actionLabel = AUDIT_ACTION_LABELS[log.action] || log.action;
    const actionColor = AUDIT_ACTION_COLORS[log.action] || 'badge-neutral';
    const bgColor = BADGE_BG_MAP[actionColor] || 'var(--badge-neutral-bg)';
    const textColor = BADGE_TEXT_MAP[actionColor] || 'var(--badge-neutral-text)';
    const projectTitle = log.projectTitle ? `<div class="font-medium">${log.projectTitle}</div>` : '';
    const orgName = log.orgId ? `<div class="text-xs text-gray-500">${getOrgName(log.orgId)}</div>` : '';
    return `
      <tr>
        <td class="text-sm">${timeStr}</td>
        <td class="font-medium">${getDisplayNameFromUsername(log.by)}</td>
        <td>
          <span class="badge-inline" style="background-color: ${bgColor}; color: ${textColor};">${actionLabel}</span>
        </td>
        <td>${projectTitle}${orgName}</td>
        <td class="text-sm text-gray-600">${log.details || '-'}</td>
      </tr>
    `;
  }).join('');
}

function clearAuditFilters() {
  const clearAllElements = (id, defaultValue = '') => {
    const elements = document.querySelectorAll(`#${id}`);
    elements.forEach(el => {
      el.value = defaultValue;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  clearAllElements('auditFilterFrom', '');
  clearAllElements('auditFilterAction', '');
  clearAllElements('auditFilterBy', '');
  clearAllElements('auditSortOrder', 'newest');

  setTimeout(() => filterAuditLog(), 10);
}
