/**
 * ================================================================================
 * Projects Page - หน้าจัดการโครงการ
 * ================================================================================
 * 
 * ไฟล์นี้จัดการหน้าจัดการโครงการ
 * 
 * ================================================================================
 * ฟังก์ชัน:
 * ================================================================================
 * 
 * - renderProjects()       - แสดงหน้าจัดการโครงการ
 * - renderProjectsAll()     - แสดงหน้าดูโครงการทั้งหมด (view-only)
 * - filterProjects()       - กรองโครงการตามเงื่อนไข
 * - openProjectModal()     - เปิด modal สร้าง/แก้ไขโครงการ
 * - saveProject()          - บันทึกโครงการ
 * - deleteProject()        - ลบโครงการ
 * - previewProjectImages() - แสดงตัวอย่างรูปภาพ
 * 
 * ================================================================================
 * สิทธิ์การเข้าถึง:
 * ================================================================================
 * 
 * - Admin: จัดการโครงการทั้งหมดได้
 * - Manager: จัดการเฉพาะโครงการของหน่วยงานตัวเอง
 * 
 * ================================================================================
 */

// ==================== Projects Page ====================
let projectsScope = 'manage';

function renderProjects() {
  const content = document.getElementById('pageContent');
  projectsScope = 'manage';

  const visibleProjects = session.role === 'admin'
    ? DB.projects
    : DB.projects.filter(p => p.orgId === session.orgId);

  content.innerHTML = `
    <div class="page">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">จัดการโครงการ</h1>
          <p class="text-gray-500 mt-2">${session.role === 'admin' ? 'ดู แก้ไข และจัดการโครงการทั้งหมด' : 'จัดการเฉพาะโครงการของหน่วยงานตนเอง'}</p>
        </div>
        <button onclick="openProjectModal()" class="btn btn-outline gap-2 whitespace-nowrap">
          <i class="fas fa-plus-circle"></i>
          <span class="hidden sm:inline">สร้างโครงการใหม่</span>
          <span class="sm:hidden">สร้างใหม่</span>
        </button>
      </div>

      <div class="stat-card mb-6 filter-sticky">
        <details class="lg:hidden">
          <summary class="cursor-pointer btn btn-outline btn-sm w-full justify-between mb-4">
            <span><i class="fas fa-filter mr-2"></i>ตัวกรอง</span>
            <i class="fas fa-chevron-down transition-transform"></i>
          </summary>
          <div class="mt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
              <div class="sm:col-span-2 md:col-span-3">
                <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
                <input type="text" id="searchProject" class="input input-bordered w-full" placeholder="ค้นหาชื่อโครงการ" oninput="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">กรองหน่วยงาน</label>
                <select id="filterOrg" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="">ทั้งหมด</option>
                  ${DB.orgs.map(o => `<option value="${o.id}">${o.name}</option>`).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">กรอง SDG</label>
                <select id="filterSdg" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="">ทั้งหมด</option>
                  ${SDG_TARGETS.map(t => `<option value="${t.id}">${t.id} - ${t.label}</option>`).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">ปีงบประมาณ</label>
                <select id="filterYear" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="">ทั้งหมด</option>
                  ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => `<option value="${year}">${year}</option>`).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
                <input type="number" id="filterBudgetMin" class="input input-bordered w-full" placeholder="เช่น 10000" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
                <input type="number" id="filterBudgetMax" class="input input-bordered w-full" placeholder="เช่น 1000000" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">วันที่เริ่ม (ตั้งแต่)</label>
                <input type="date" id="filterFrom" class="input input-bordered w-full" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">วันที่สิ้นสุด (ถึง)</label>
                <input type="date" id="filterTo" class="input input-bordered w-full" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <button onclick="clearProjectFilters()" class="btn btn-outline btn-sm w-full whitespace-nowrap">
                  <span class="hidden sm:inline">ล้างตัวกรอง</span>
                  <span class="sm:hidden">ล้าง</span>
                </button>
              </div>
            </div>
          </div>
        </details>

        <div class="hidden lg:block">
          <div class="flex flex-wrap items-end gap-2">
            <div class="shrink min-w-[180px] flex-1 max-w-[200px]">
              <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
              <input type="text" id="searchProject" class="input input-bordered w-full text-sm" placeholder="ค้นหาโครงการ" oninput="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">กรองหน่วยงาน</label>
              <select id="filterOrg" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="">ทั้งหมด</option>
                ${DB.orgs.map(o => `<option value="${o.id}">${o.name}</option>`).join('')}
              </select>
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[180px]">
              <label class="block text-sm font-medium mb-1">กรอง SDG</label>
              <select id="filterSdg" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="">ทั้งหมด</option>
                ${SDG_TARGETS.map(t => `<option value="${t.id}">${t.id} - ${t.label}</option>`).join('')}
              </select>
            </div>
            <div class="shrink min-w-[120px] flex-1 max-w-[140px]">
              <label class="block text-sm font-medium mb-1">ปีงบประมาณ</label>
              <select id="filterYear" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="">ทั้งหมด</option>
                ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => `<option value="${year}">${year}</option>`).join('')}
              </select>
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
              <input type="number" id="filterBudgetMin" class="input input-bordered w-full text-sm" placeholder="เช่น 10000" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
              <input type="number" id="filterBudgetMax" class="input input-bordered w-full text-sm" placeholder="เช่น 1000000" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">วันที่เริ่ม (ตั้งแต่)</label>
              <input type="date" id="filterFrom" class="input input-bordered w-full text-sm" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">วันที่สิ้นสุด (ถึง)</label>
              <input type="date" id="filterTo" class="input input-bordered w-full text-sm" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">เรียงลำดับ</label>
              <select id="projectSortOrder" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="updatedAt-desc" selected>ใหม่ล่าสุดก่อน</option>
                <option value="updatedAt-asc">เก่าที่สุดก่อน</option>
              </select>
            </div>
            <div class="flex items-end">
              <button onclick="clearProjectFilters()" class="btn btn-outline btn-sm w-full whitespace-nowrap">
                <span class="hidden sm:inline">ล้างตัวกรอง</span>
                <span class="sm:hidden">ล้าง</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderProjectCards(visibleProjects)}
      </div>
    </div>
  `;
  setTimeout(() => filterProjects(), 0);
}

function renderProjectsAll() {
  const content = document.getElementById('pageContent');
  projectsScope = 'all';

  content.innerHTML = `
    <div class="page">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">โครงการทั้งหมด</h1>
          <p class="text-gray-500 mt-2">ดูรายละเอียดโครงการของทุกหน่วยงาน (แก้ไขได้เฉพาะของหน่วยงานตนเอง)</p>
        </div>
      </div>

      <div class="stat-card mb-6 filter-sticky">
        <details class="lg:hidden">
          <summary class="cursor-pointer btn btn-outline btn-sm w-full justify-between mb-4">
            <span><i class="fas fa-filter mr-2"></i>ตัวกรอง</span>
            <i class="fas fa-chevron-down transition-transform"></i>
          </summary>
          <div class="mt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
              <div class="sm:col-span-2 md:col-span-3">
                <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
                <input type="text" id="searchProject" class="input input-bordered w-full" placeholder="ค้นหาชื่อโครงการ" oninput="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">กรองหน่วยงาน</label>
                <select id="filterOrg" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="">ทั้งหมด</option>
                  ${DB.orgs.map(o => `<option value="${o.id}">${o.name}</option>`).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">กรอง SDG</label>
                <select id="filterSdg" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="">ทั้งหมด</option>
                  ${SDG_TARGETS.map(t => `<option value="${t.id}">${t.id} - ${t.label}</option>`).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">ปีงบประมาณ</label>
                <select id="filterYear" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="">ทั้งหมด</option>
                  ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => `<option value="${year}">${year}</option>`).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
                <input type="number" id="filterBudgetMin" class="input input-bordered w-full" placeholder="เช่น 10000" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
                <input type="number" id="filterBudgetMax" class="input input-bordered w-full" placeholder="เช่น 1000000" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">วันที่เริ่ม (ตั้งแต่)</label>
                <input type="date" id="filterFrom" class="input input-bordered w-full" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">วันที่สิ้นสุด (ถึง)</label>
                <input type="date" id="filterTo" class="input input-bordered w-full" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">เรียงลำดับ</label>
                <select id="projectSortOrder" class="select select-bordered w-full" onchange="filterProjects(event)">
                  <option value="updatedAt-desc" selected>ล่าสุดก่อน</option>
                  <option value="updatedAt-asc">เก่าที่สุดก่อน</option>
                </select>
              </div>
              <div class="flex items-end sm:col-span-1 md:col-span-1">
                <button onclick="clearProjectFilters()" class="btn btn-outline btn-sm w-full whitespace-nowrap">
                  <span class="hidden sm:inline">ล้างตัวกรอง</span>
                  <span class="sm:hidden">ล้าง</span>
                </button>
              </div>
            </div>
          </div>
        </details>

        <div class="hidden lg:block">
          <div class="flex flex-wrap items-end gap-2">
            <div class="shrink min-w-[180px] flex-1 max-w-[200px]">
              <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
              <input type="text" id="searchProject" class="input input-bordered w-full text-sm" placeholder="ค้นหาโครงการ" oninput="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">กรองหน่วยงาน</label>
              <select id="filterOrg" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="">ทั้งหมด</option>
                ${DB.orgs.map(o => `<option value="${o.id}">${o.name}</option>`).join('')}
              </select>
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[180px]">
              <label class="block text-sm font-medium mb-1">กรอง SDG</label>
              <select id="filterSdg" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="">ทั้งหมด</option>
                ${SDG_TARGETS.map(t => `<option value="${t.id}">${t.id} - ${t.label}</option>`).join('')}
              </select>
            </div>
            <div class="shrink min-w-[120px] flex-1 max-w-[140px]">
              <label class="block text-sm font-medium mb-1">ปีงบประมาณ</label>
              <select id="filterYear" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="">ทั้งหมด</option>
                ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => `<option value="${year}">${year}</option>`).join('')}
              </select>
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
              <input type="number" id="filterBudgetMin" class="input input-bordered w-full text-sm" placeholder="เช่น 10000" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
              <input type="number" id="filterBudgetMax" class="input input-bordered w-full text-sm" placeholder="เช่น 1000000" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">วันที่เริ่ม (ตั้งแต่)</label>
              <input type="date" id="filterFrom" class="input input-bordered w-full text-sm" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">วันที่สิ้นสุด (ถึง)</label>
              <input type="date" id="filterTo" class="input input-bordered w-full text-sm" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">เรียงลำดับ</label>
              <select id="projectSortOrder" class="select select-bordered w-full text-sm" onchange="filterProjects(event)">
                <option value="updatedAt-desc" selected>ใหม่ล่าสุดก่อน</option>
                <option value="updatedAt-asc">เก่าที่สุดก่อน</option>
              </select>
            </div>
            <div class="flex items-end">
              <button onclick="clearProjectFilters()" class="btn btn-outline btn-sm w-full whitespace-nowrap">
                <span class="hidden sm:inline">ล้างตัวกรอง</span>
                <span class="sm:hidden">ล้าง</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderProjectCards(DB.projects)}
      </div>
    </div>
  `;
  setTimeout(() => filterProjects(), 0);
}

function renderProjectCards(projects) {
  if (projects.length === 0) {
    return `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-lg">ไม่พบโครงการ</p>
      </div>
    `;
  }

  return projects.map(p => {
    const sdgBadges = (p.sdg || []).slice(0, 3).map(s => {
      const target = SDG_TARGETS.find(t => t.id === s);
      const colors = getSoftBadgeColors(target?.color);
      return `<span class="badge badge-sm" style="background: ${colors.bg}; color: ${colors.text};">${s}</span>`;
    }).join(' ');

    return `
      <div class="stat-card card-hover cursor-pointer" onclick="viewProject('${p.id}')">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 rounded-xl gradient-purple flex items-center justify-center text-white text-xl shadow-md">
            <i class="fas fa-project-diagram"></i>
          </div>
        </div>

        <h3 class="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">${p.title}</h3>

        <div class="text-sm text-gray-500 mb-3">
          <i class="fas fa-building mr-1"></i> ${getOrgName(p.orgId)}
        </div>

        <div class="flex flex-wrap gap-1 mb-3">
          ${sdgBadges}
        </div>

        <div class="flex justify-between items-center pt-3 border-t">
          <div class="text-sm text-gray-500">
            <i class="fas fa-dollar-sign mr-1"></i>
            <span class="font-semibold">${formatMoney(p.budget)}</span> บาท
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterProjects(event) {
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

  const getValue = (id) => {
    if (event && event.target && event.target.id === id) return event.target.value;
    const el = getVisibleElement(id);
    return el?.value || '';
  };

  const search = getValue('searchProject').toLowerCase();
  const orgFilter = getValue('filterOrg');
  const sdgFilter = getValue('filterSdg');
  const yearFilterInput = getValue('filterYear');
  const yearFilter = yearFilterInput ? Number(yearFilterInput) : '';
  const budgetMin = getValue('filterBudgetMin');
  const budgetMax = getValue('filterBudgetMax');
  const from = getValue('filterFrom');
  const to = getValue('filterTo');

  let projects = [];
  if (projectsScope === 'all') {
    projects = DB.projects.slice();
  } else {
    projects = session.role === 'admin'
      ? DB.projects.slice()
      : DB.projects.filter(p => p.orgId === session.orgId);
  }

  if (search) projects = projects.filter(p => p.title.toLowerCase().includes(search));
  if (orgFilter) projects = projects.filter(p => p.orgId === orgFilter);
  if (sdgFilter) projects = projects.filter(p => (p.sdg || []).includes(sdgFilter));
  if (yearFilter) projects = projects.filter(p => p.year === yearFilter);

  if (budgetMin || budgetMax) {
    const min = budgetMin ? Number(budgetMin) : 0;
    const max = budgetMax ? Number(budgetMax) : Infinity;
    projects = projects.filter(p => {
      const budget = p.budget || 0;
      return budget >= min && budget <= max;
    });
  }

  if (from || to) {
    const fromD = from ? new Date(from + 'T00:00:00') : null;
    const toD = to ? new Date(to + 'T23:59:59') : null;
    projects = projects.filter(p => {
      const s = p.startDate ? new Date(p.startDate + 'T00:00:00') : null;
      const e = p.endDate ? new Date(p.endDate + 'T23:59:59') : null;
      if (!s && !e) return true;
      const start = s || e;
      const end = e || s;
      if (fromD && end && end < fromD) return false;
      if (toD && start && start > toD) return false;
      return true;
    });
  }

  let sortOrder = 'updatedAt-desc';
  if (event && event.target && event.target.id === 'projectSortOrder') {
    sortOrder = event.target.value || 'updatedAt-desc';
  } else {
    const sortSelect = getVisibleElement('projectSortOrder');
    sortOrder = sortSelect?.value || 'updatedAt-desc';
  }

  if (sortOrder === 'updatedAt-desc') {
    projects.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  } else if (sortOrder === 'updatedAt-asc') {
    projects.sort((a, b) => (a.updatedAt || a.createdAt || 0) - (b.updatedAt || b.createdAt || 0));
  }

  const grid = document.getElementById('projectsGrid');
  if (grid) grid.innerHTML = renderProjectCards(projects);
}

function clearProjectFilters() {
  const clearAllElements = (id, defaultValue = '') => {
    const elements = document.querySelectorAll(`#${id}`);
    elements.forEach(el => {
      el.value = defaultValue;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  clearAllElements('searchProject', '');
  clearAllElements('filterOrg', '');
  clearAllElements('filterSdg', '');
  clearAllElements('filterYear', '');
  clearAllElements('filterBudgetMin', '');
  clearAllElements('filterBudgetMax', '');
  clearAllElements('filterFrom', '');
  clearAllElements('filterTo', '');
  clearAllElements('projectSortOrder', 'updatedAt-desc');

  setTimeout(() => filterProjects(), 10);
}

async function openProjectModal(projectId = null) {
  const project = projectId ? DB.projects.find(p => p.id === projectId) : null;

  const { value: formData } = await Swal.fire({
    title: project ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่',
    html: `
      <div class="space-y-4 text-left max-h-[500px] overflow-y-auto px-2">
        <div>
          <label class="block text-sm font-medium mb-2">ชื่อโครงการ</label>
          <input id="swal-title" class="input input-bordered w-full" value="${project?.title || ''}" placeholder="ระบุชื่อโครงการ">
          <p id="swal-err-title" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        ${session.role === 'admin' ? `
        <div>
          <label class="block text-sm font-medium mb-2">หน่วยงาน</label>
          <select id="swal-org" class="select select-bordered w-full">
            ${DB.orgs.map(o => `<option value="${o.id}" ${project?.orgId === o.id ? 'selected' : ''}>${o.name}</option>`).join('')}
          </select>
        </div>
        ` : ''}
        <div>
          <label class="block text-sm font-medium mb-2">งบประมาณ (บาท)</label>
          <input id="swal-budget" type="number" class="input input-bordered w-full" value="${project?.budget || ''}" placeholder="เช่น 50000">
          <p id="swal-err-budget" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">ผู้รับผิดชอบ</label>
          <input id="swal-owner" class="input input-bordered w-full" value="${project?.owner || ''}" placeholder="ชื่อผู้รับผิดชอบ">
          <p id="swal-err-owner" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        <div class="relative">
          <label class="block text-sm font-medium mb-2">ปีงบประมาณ</label>
          <input id="swal-year" type="text" class="input input-bordered w-full year-picker-input" value="${project?.year || ''}" placeholder="เช่น 2569" readonly onclick="openYearPicker('swal-year')">
          <input type="hidden" id="swal-yearValue" value="${project?.year || ''}">
          <p id="swal-err-year" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">วันเริ่มต้น</label>
            <input id="swal-start" type="date" class="input input-bordered w-full" value="${project?.startDate || ''}">
            <p id="swal-err-start" class="text-red-600 text-xs mt-1 hidden"></p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">วันสิ้นสุด</label>
            <input id="swal-end" type="date" class="input input-bordered w-full" value="${project?.endDate || ''}">
            <p id="swal-err-end" class="text-red-600 text-xs mt-1 hidden"></p>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">วัตถุประสงค์</label>
          <textarea id="swal-objective" class="textarea textarea-bordered w-full" rows="3" placeholder="อธิบายวัตถุประสงค์โครงการ">${project?.objective || ''}</textarea>
          <p id="swal-err-objective" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">นโยบาย/ข้อเสนอแนะ</label>
          <textarea id="swal-policy" class="textarea textarea-bordered w-full" rows="2" placeholder="นโยบายที่เกี่ยวข้อง">${project?.policy || ''}</textarea>
          <p id="swal-err-policy" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">SDG Target</label>
          <div class="grid grid-cols-2 gap-2">
            ${SDG_TARGETS.map(t => `
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100">
                <input type="checkbox" class="checkbox checkbox-sm" value="${t.id}" ${project?.sdg?.includes(t.id) ? 'checked' : ''}>
                <span class="text-sm">${t.id} - ${t.label}</span>
              </label>
            `).join('')}
          </div>
          <p id="swal-err-sdg" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">รูปกิจกรรม (อย่างน้อย 3 รูป สูงสุด 4 รูป)</label>
          <label id="swal-image-label" class="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 text-blue-700 font-medium text-sm cursor-pointer transition-colors">
            <input type="file" id="swal-images" accept="image/*" multiple class="hidden">
            <i class="fas fa-image text-blue-600"></i>
            <span id="swal-image-count">เลือกรูปภาพ (${project?.images?.length || 0}/4)</span>
          </label>
          <div id="swal-image-preview" class="mt-2 grid grid-cols-2 gap-2">
            ${project?.images?.map(img => `
              <div class="relative group">
                <img src="${img.dataUrl}" alt="${img.name}" class="w-full h-24 object-cover rounded-lg border border-gray-200">
                <div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button type="button" onclick="removeImagePreview('${img.id}')" class="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-red-600 shadow-lg border border-gray-200 text-sm font-medium transition-colors flex items-center gap-1.5">
                    <i class="fas fa-trash-alt text-xs"></i>ลบ
                  </button>
                </div>
              </div>
            `).join('') || ''}
          </div>
          <p id="swal-err-images" class="text-red-600 text-xs mt-1 hidden"></p>
        </div>
      </div>
    `,
    width: 800,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#2563eb',
    didOpen: () => {
      const fileInput = document.getElementById('swal-images');
      const previewDiv = document.getElementById('swal-image-preview');
      const countSpan = document.getElementById('swal-image-count');
      let selectedImages = project?.images ? [...project.images] : [];

      const updateCount = () => {
        if (countSpan) countSpan.textContent = `เลือกรูปภาพ (${selectedImages.length}/4)`;
      };

      const clearFormErrors = () => {
        ['title', 'budget', 'owner', 'year', 'start', 'end', 'objective', 'policy', 'sdg', 'images'].forEach(suffix => {
          const el = document.getElementById('swal-err-' + suffix);
          if (el) { el.classList.add('hidden'); el.textContent = ''; }
        });
      };

      const popup = document.querySelector('.swal2-popup');
      popup?.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', clearFormErrors);
        el.addEventListener('change', clearFormErrors);
      });

      const updatePreview = () => {
        if (!previewDiv) return;
        previewDiv.innerHTML = selectedImages.map(img => `
          <div class="relative group">
            <img src="${img.dataUrl}" alt="${img.name}" class="w-full h-24 object-cover rounded-lg border border-gray-200">
            <div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button type="button" onclick="removeImagePreview('${img.id}')" class="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-red-600 shadow-lg border border-gray-200 text-sm font-medium transition-colors flex items-center gap-1.5">
                <i class="fas fa-trash-alt text-xs"></i>ลบ
              </button>
            </div>
          </div>
        `).join('');
        updateCount();
      };

      fileInput?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (selectedImages.length + files.length > 4) {
          const errEl = document.getElementById('swal-err-images');
          if (errEl) {
            errEl.textContent = 'สามารถเพิ่มรูปได้สูงสุด 4 รูปเท่านั้น';
            errEl.classList.remove('hidden');
          }
          return;
        }
        for (const file of files) {
          const dataUrl = await fileToDataURL(file);
          selectedImages.push({ id: randomId('img'), name: file.name, dataUrl, createdAt: Date.now() });
        }
        updatePreview();
        e.target.value = '';
      });

      window.removeImagePreview = (imgId) => {
        selectedImages = selectedImages.filter(img => img.id !== imgId);
        updatePreview();
      };

      window.getSelectedImages = () => selectedImages;
      updateCount();
    },
    preConfirm: async () => {
      const title = document.getElementById('swal-title').value.trim();
      const budget = document.getElementById('swal-budget').value;
      const owner = document.getElementById('swal-owner').value.trim();
      const yearInput = document.getElementById('swal-yearValue')?.value || document.getElementById('swal-year')?.value || '';
      const startDate = document.getElementById('swal-start').value.trim();
      const endDate = document.getElementById('swal-end').value.trim();
      const objective = document.getElementById('swal-objective').value.trim();
      const policy = document.getElementById('swal-policy').value.trim();
      const orgId = session.role === 'admin' ? document.getElementById('swal-org')?.value : session.orgId;
      const sdg = Array.from(document.querySelectorAll('.swal2-popup input[type="checkbox"]:checked')).map(cb => cb.value);
      const images = window.getSelectedImages ? window.getSelectedImages() : (project?.images || []);

      const showErr = (id, msg) => {
        const el = document.getElementById('swal-err-' + id);
        if (el) { el.textContent = msg; el.classList.remove('hidden'); }
      };

      ['title', 'budget', 'owner', 'year', 'start', 'end', 'objective', 'policy', 'sdg', 'images'].forEach(suffix => {
        const el = document.getElementById('swal-err-' + suffix);
        if (el) { el.classList.add('hidden'); el.textContent = ''; }
      });

      let hasError = false;
      if (!title) { showErr('title', 'กรุณาระบุชื่อโครงการ'); hasError = true; }
      if (!budget || budget.trim() === '') { showErr('budget', 'กรุณาระบุงบประมาณ'); hasError = true; }
      else {
        const parsedBudget = Number(budget);
        if (Number.isNaN(parsedBudget) || parsedBudget < 0) { showErr('budget', 'กรุณาระบุให้ถูกต้อง (ตัวเลขไม่เป็นลบ)'); hasError = true; }
      }
      if (!owner) { showErr('owner', 'กรุณาระบุผู้รับผิดชอบ'); hasError = true; }
      if (!yearInput || !yearInput.trim()) { showErr('year', 'กรุณาระบุปีงบประมาณ'); hasError = true; }
      else {
        const parsedYear = Number(yearInput);
        if (Number.isNaN(parsedYear) || parsedYear < 2400) { showErr('year', 'กรุณาระบุให้ถูกต้อง'); hasError = true; }
      }
      if (!startDate) { showErr('start', 'กรุณาระบุวันเริ่มต้น'); hasError = true; }
      if (!endDate) { showErr('end', 'กรุณาระบุวันสิ้นสุด'); hasError = true; }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) { showErr('end', 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น'); hasError = true; }
      if (!objective) { showErr('objective', 'กรุณาระบุวัตถุประสงค์'); hasError = true; }
      if (!policy) { showErr('policy', 'กรุณาระบุนโยบาย/ข้อเสนอแนะ'); hasError = true; }
      if (!sdg || sdg.length === 0) { showErr('sdg', 'กรุณาเลือกอย่างน้อย 1 รายการ'); hasError = true; }
      if (images.length < 3) { showErr('images', 'กรุณาอัปโหลดอย่างน้อย 3 รูป'); hasError = true; }
      if (images.length > 4) { showErr('images', 'สามารถเพิ่มรูปได้สูงสุด 4 รูป'); hasError = true; }

      if (hasError) return false;

      const parsedBudget = Number(budget);
      const parsedYear = Number(yearInput) || 2569;
      const body = { title, budget: parsedBudget, owner, year: parsedYear, startDate, endDate, objective, policy, sdg, orgId: orgId || session.orgId, images };

      try {
        if (project) {
          await api.updateProject(project.id, body);
        } else {
          await api.createProject(body);
        }
        return body;
      } catch (e) {
        const msg = e.message || 'เกิดข้อผิดพลาด';
        const fieldMap = { 'ผู้รับผิดชอบ': 'owner', 'งบประมาณ': 'budget', 'ปีงบประมาณ': 'year', 'วันเริ่มต้น': 'start', 'วันสิ้นสุด': 'end', 'วัตถุประสงค์': 'objective', 'นโยบาย': 'policy', 'SDG': 'sdg', 'รูปกิจกรรม': 'images', 'ชื่อโครงการ': 'title' };
        let target = 'title';
        for (const [k, v] of Object.entries(fieldMap)) { if (msg.includes(k)) { target = v; break; } }
        showErr(target, msg);
        return false;
      }
    }
  });

  if (formData) {
    showSuccess(formData.title ? 'อัปเดตสำเร็จ' : 'สร้างสำเร็จ', formData.title ? 'โครงการถูกอัปเดตแล้ว' : `โครงการใหม่ถูกสร้างแล้ว${(formData.images?.length || 0) > 0 ? ` พร้อมรูป ${formData.images.length} รูป` : ''}`);
    await refreshFromApi();
    renderProjects();
  }
}

function renderProjectForm() {
  openProjectModal();
  navigateTo('projects');
}

async function viewProject(projectId) {
  const project = DB.projects.find(p => p.id === projectId);
  if (!project) {
    showError('ไม่พบโครงการ');
    return;
  }

  const editable = projectsScope === 'manage' && canEdit(project);
  const sdgBadges = (project.sdg || []).map(s => {
    const target = SDG_TARGETS.find(t => t.id === s);
    const colors = getSoftBadgeColors(target?.color);
    return `<span class="badge badge-lg" style="background: ${colors.bg}; color: ${colors.text}; margin: 4px;">${s} - ${target?.label || s}</span>`;
  }).join('');

  await Swal.fire({
    title: project.title,
    html: `
      <div class="text-left space-y-6 max-h-[600px] overflow-y-auto px-2">
        <div class="flex gap-2 flex-wrap">
          ${editable ? `
            <button class="btn btn-sm btn-outline text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300" onclick="Swal.close(); setTimeout(() => openProjectModal('${projectId}'), 100);">
              <i class="fas fa-edit mr-1.5"></i>แก้ไข
            </button>
            <button class="btn btn-sm btn-outline text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300" onclick="Swal.close(); setTimeout(() => deleteProject('${projectId}'), 100);">
              <i class="fas fa-trash mr-1.5"></i>ลบ
            </button>
          ` : ''}
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-sm text-gray-500">หน่วยงาน</p><p class="font-semibold">${getOrgName(project.orgId)}</p></div>
          <div><p class="text-sm text-gray-500">งบประมาณ</p><p class="font-semibold">${formatMoney(project.budget)} บาท</p></div>
          <div><p class="text-sm text-gray-500">ผู้รับผิดชอบ</p><p class="font-semibold">${project.owner || '-'}</p></div>
          <div><p class="text-sm text-gray-500">ปีงบประมาณ</p><p class="font-semibold">${project.year}</p></div>
          <div><p class="text-sm text-gray-500">วันเริ่มต้น</p><p class="font-semibold">${formatDate(project.startDate)}</p></div>
          <div><p class="text-sm text-gray-500">วันสิ้นสุด</p><p class="font-semibold">${formatDate(project.endDate)}</p></div>
        </div>
        <div><p class="text-sm text-gray-500 mb-2">วัตถุประสงค์</p><p class="text-sm">${project.objective || '-'}</p></div>
        <div><p class="text-sm text-gray-500 mb-2">นโยบาย/ข้อเสนอแนะ</p><p class="text-sm">${project.policy || '-'}</p></div>
        <div><p class="text-sm text-gray-500 mb-2">SDG Target</p><div>${sdgBadges}</div></div>
        <div>
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-500">รูปกิจกรรม (${project.images?.length || 0}/4)</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            ${project.images?.length > 0
              ? project.images.map(img => `
                <div class="image-preview">
                  <img src="${img.dataUrl}" alt="${img.name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
                </div>
              `).join('')
              : '<p class="text-gray-500 text-center py-8 col-span-2">ยังไม่มีรูปภาพ</p>'}
          </div>
          ${(project.images?.length || 0) < 3 ? `
            <div class="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50/80 flex items-start gap-2">
              <i class="fas fa-info-circle text-amber-600 mt-0.5 flex-shrink-0"></i>
              <span class="text-sm text-amber-800">ควรมีรูปอย่างน้อย 3 รูปก่อนสรุป/ส่งรายงาน</span>
            </div>
          ` : ''}
        </div>
        <div class="text-xs text-gray-400 pt-4 border-t">
          <p>สร้างเมื่อ: ${new Date(project.createdAt).toLocaleString('th-TH')}</p>
          <p>แก้ไขล่าสุด: ${new Date(project.updatedAt).toLocaleString('th-TH')}</p>
          <p>ผู้แก้ไขล่าสุด: ${getDisplayNameFromUsername(project.updatedBy)}</p>
        </div>
      </div>
    `,
    width: 900,
    showConfirmButton: false,
    showCloseButton: true
  });
}

async function uploadProjectImages(projectId, input) {
  const project = DB.projects.find(p => p.id === projectId);
  if (!project) return;

  const files = Array.from(input.files);
  if (files.length === 0) return;

  const newImages = [];
  for (const file of files) {
    if ((project.images?.length || 0) + newImages.length >= 4) {
      showWarning('เกินจำนวน', 'สามารถเพิ่มรูปได้สูงสุด 4 รูปเท่านั้น');
      break;
    }
    const dataUrl = await fileToDataURL(file);
    newImages.push({ name: file.name, dataUrl });
  }
  if (newImages.length === 0) return;

  try {
    await api.uploadProjectImages(projectId, newImages);
    await refreshFromApi();
    showSuccess('อัปโหลดสำเร็จ', `เพิ่มรูป ${newImages.length} รูป`);
  } catch (e) {
    showError('เกิดข้อผิดพลาด', e.message);
    return;
  }
  Swal.close();
  viewProject(projectId);
}

async function deleteProjectImage(projectId, imageId) {
  const ok = await confirm('ลบรูปภาพ', 'ต้องการลบรูปภาพนี้ใช่หรือไม่?', 'ลบ');
  if (!ok) return;

  const project = DB.projects.find(p => p.id === projectId);
  if (!project) return;
  try {
    await api.deleteProjectImage(projectId, imageId);
    await refreshFromApi();
    showSuccess('ลบสำเร็จ', 'รูปภาพถูกลบแล้ว');
    Swal.close();
    viewProject(projectId);
  } catch (e) {
    showError('เกิดข้อผิดพลาด', e.message);
  }
}

async function deleteProject(projectId) {
  const project = DB.projects.find(p => p.id === projectId);
  if (!project) {
    showError('ไม่พบโครงการ');
    return;
  }

  if (!canEdit(project)) {
    showError('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์ลบโครงการนี้');
    return;
  }

  const ok = await confirm(
    'ลบโครงการ',
    `ต้องการลบโครงการ "${project.title}" ใช่หรือไม่? การลบจะไม่สามารถกู้คืนได้`,
    'ลบโครงการ'
  );

  if (ok) {
    try {
      await api.deleteProject(projectId);
      await refreshFromApi();
      showSuccess('ลบสำเร็จ', 'โครงการถูกลบแล้ว');
    } catch (e) {
      showError('เกิดข้อผิดพลาด', e.message);
      return;
    }
    if (currentPage === 'projects' || currentPage === 'projects-all') renderProjects();
    else navigateTo('projects');
  }
}
