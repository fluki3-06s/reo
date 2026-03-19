/**
 * ================================================================================
 * Dashboard Page - หน้าแดชบอร์ด
 * ================================================================================
 * 
 * ไฟล์นี้จัดการหน้า Dashboard ซึ่งแสดงสถิติและภาพรวมของระบบ
 * 
 * ================================================================================
 * ข้อมูลที่แสดง:
 * ================================================================================
 * 
 * 1. การ์ดสถิติ:
 *    - จำนวนโครงการทั้งหมด
 *    - งบประมาณรวม
 *    - จำนวนหน่วยงาน
 * 
 * 2. กราฟ Doughnut (3 กราฟ):
 *    - SDG ที่ถูกใช้มากที่สุด 5 อันดับ
 *    - การจัดกลุ่มโครงการตามจำนวน SDG
 *    - การกระจายตามหมวดหมู่ SDG 4
 * 
 * 3. ตาราง:
 *    - สรุปตามหน่วยงาน
 *    - สรุปตาม SDG Target
 * 
 * 4. ฟังก์ชันส่งออก CSV:
 *    - เลือกโครงการที่จะส่งออก
 *    - เลือกคอลัมน์ที่ต้องการ
 *    - ดาวน์โหลดเป็นไฟล์ CSV
 * 
 * ================================================================================
 * Charts Library: Chart.js
 * ================================================================================
 * ใช้ Chart.js สำหรับวาดกราฟ doughnut
 * 
 * Doughnut Chart = กราฟวงกลมที่มีช่องว่างตรงกลาง
 * เหมาะสำหรับแสดงสัดส่วน
 * ================================================================================
 */

// ================================================================================
// Global Variables
// ================================================================================
// เก็บ chart instances เพื่อจัดการ memory
// เมื่อ re-render ต้อง destroy chart เก่าก่อน
// ================================================================================
let charts = {};

// ================================================================================
// ฟังก์ชัน: renderDashboard (Async)
// ================================================================================
// เรนเดอร์หน้า Dashboard
// 
// Flow:
// 1. แสดง loading spinner
// 2. เรียก API เพื่อดึงข้อมูล
// 3. แสดง HTML structure
// 4. เรนเดอร์ข้อมูลในตาราง
// 5. วาดกราฟ (หลัง DOM ready)
// ================================================================================
async function renderDashboard() {
  // ค้นหา element สำหรับแสดงเนื้อหา
  const content = document.getElementById('pageContent');
  
  // ========================================================================
  // แสดง Loading Spinner
  // ========================================================================
  content.innerHTML = '<div class="page flex items-center justify-center min-h-[200px]"><span class="loading loading-spinner loading-lg text-primary"></span></div>';

  // ตัวแปรสำหรับเก็บข้อมูล
  let totalProjects = 0, totalBudget = 0, totalOrgs = 0;
  let byOrgItems = [], bySdgItems = [];

  try {
    // ========================================================================
    // เรียก API พร้อมกัน 3 endpoints
    // ========================================================================
    // Promise.all คือรอให้ทุก API ตอบกลับก่อน
    // ทำให้โหลดเร็วขึ้น
    const [summary, byOrg, bySdg] = await Promise.all([
      api.getDashboardSummary(),  // สถิติหลัก
      api.getDashboardByOrg(),    // สถิติตามหน่วยงาน
      api.getDashboardBySdg()     // สถิติตาม SDG
    ]);
    
    // ดึงข้อมูลจาก response
    totalProjects = summary.totalProjects ?? 0;
    totalBudget = summary.totalBudget ?? 0;
    totalOrgs = summary.totalOrgs ?? 0;
    byOrgItems = byOrg;
    bySdgItems = bySdg;
    
  } catch (e) {
    // กรณีเกิด error
    content.innerHTML = `<div class="page"><div class="alert alert-error">${e.message || 'โหลดข้อมูลไม่สำเร็จ'}</div></div>`;
    return;
  }

  // ========================================================================
  // เก็บข้อมูลใน window เพื่อให้ functions อื่นเข้าถึงได้
  // ========================================================================
  window._dashboardByOrg = byOrgItems;
  window._dashboardBySdg = bySdgItems;

  // ========================================================================
  // HTML Structure
  // ========================================================================
  // แบ่งเป็น 4 ส่วน:
  // 1. Header + ปุ่มส่งออก CSV
  // 2. การ์ดสถิติ 3 การ์ด
  // 3. กราฟ 3 กราฟ
  // 4. ตาราง 2 ตาราง
  // ========================================================================
  content.innerHTML = `
    <div class="page">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">Dashboard</h1>
          <p class="text-gray-500 mt-2">สรุปข้อมูลโครงการและหน่วยงาน</p>
        </div>
        <button onclick="exportCSV()" class="btn btn-outline gap-2 whitespace-nowrap">
          <i class="fas fa-download"></i>
          <span class="hidden sm:inline">ส่งออกข้อมูล</span>
          <span class="sm:hidden">ส่งออก</span>
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- โครงการทั้งหมด -->
        <div class="stat-card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">โครงการทั้งหมด</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">${totalProjects}</p>
              <p class="text-sm text-gray-500 mt-1">รายการ</p>
            </div>
            <div class="w-16 h-16 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i class="fas fa-project-diagram"></i>
            </div>
          </div>
        </div>

        <!-- งบประมาณรวม -->
        <div class="stat-card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">งบประมาณรวม</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">${formatMoney(totalBudget)}</p>
              <p class="text-sm text-gray-500 mt-1">บาท</p>
            </div>
            <div class="w-16 h-16 shrink-0 rounded-xl bg-green-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i class="fas fa-dollar-sign"></i>
            </div>
          </div>
        </div>

        <!-- หน่วยงาน -->
        <div class="stat-card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">หน่วยงาน</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">${totalOrgs}</p>
              <p class="text-sm text-gray-500 mt-1">หน่วยงานที่ใช้งาน</p>
            </div>
            <div class="w-16 h-16 shrink-0 rounded-xl bg-orange-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i class="fas fa-building"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- กราฟ SDG ที่ใช้มากที่สุด -->
        <div class="stat-card card-hover">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">เป้าหมาย SDG ที่ถูกใช้มากที่สุด 5 อันดับแรก</h3>
          <div class="chart-container">
            <canvas id="chartSdgTop"></canvas>
          </div>
          <div class="text-center mt-4">
            <p class="text-xl font-bold text-gray-800" id="kpiSdgTop">-</p>
            <p class="text-sm text-gray-500">เป้าหมายย่อยที่มีการใช้งานมากที่สุด</p>
          </div>
        </div>

        <!-- กราฟจำนวน SDG ต่อโครงการ -->
        <div class="stat-card card-hover">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">การจัดกลุ่มโครงการตามจำนวนเป้าหมาย SDG</h3>
          <div class="chart-container">
            <canvas id="chartSdgMulti"></canvas>
          </div>
          <div class="text-center mt-4">
            <p class="text-xl font-bold text-gray-800" id="kpiMultiPct">-</p>
            <p class="text-sm text-gray-500">สัดส่วนโครงการที่มีหลายเป้าหมาย SDG</p>
          </div>
        </div>

        <!-- กราฟการกระจายตามหมวดหมู่ -->
        <div class="stat-card card-hover">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">การกระจายตามหมวดหมู่ SDG 4</h3>
          <div class="chart-container">
            <canvas id="chartSdgGroups"></canvas>
          </div>
          <div class="text-center mt-4">
            <p class="text-xl font-bold text-gray-800" id="kpiTopGroup">-</p>
            <p class="text-sm text-gray-500">หมวดหมู่ที่มีการใช้งานมากที่สุด</p>
          </div>
        </div>
      </div>

      <!-- Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- ตารางสรุปตามหน่วยงาน -->
        <div class="stat-card">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">สรุปตามหน่วยงาน</h3>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th class="min-w-[150px]">หน่วยงาน</th>
                  <th class="text-right whitespace-nowrap">โครงการ</th>
                  <th class="text-right whitespace-nowrap">งบประมาณ</th>
                </tr>
              </thead>
              <tbody id="tableByOrg">
              </tbody>
            </table>
          </div>
        </div>

        <!-- ตารางสรุปตาม SDG -->
        <div class="stat-card">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">สรุปตาม SDG Target</h3>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th class="min-w-[150px]">SDG</th>
                  <th class="text-right whitespace-nowrap">จำนวนโครงการ</th>
                </tr>
              </thead>
              <tbody id="tableBySdg">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // เรนเดอร์ข้อมูลในตาราง
  renderDashboardData();
  
  // วาดกราฟ (รอให้ DOM ready)
  scheduleDashboardCharts();
}

// ================================================================================
// ฟังก์ชัน: scheduleDashboardCharts
// ================================================================================
// วาดกราฟหลังจาก DOM และ Chart.js library โหลดเสร็จ
// 
// ปัญหา:
// - กราฟต้องใช้ canvas element ที่มีอยู่ใน DOM
// - และ Chart.js library ต้องโหลดเสร็จก่อน
// 
// วิธีแก้:
// - ลองวาดกราฟซ้ำทุก 100ms
// - ถ้าลอง 30 ครั้งแล้วยังไม่สำเร็จ → ยกเลิก
// ================================================================================
function scheduleDashboardCharts() {
  const tryRender = (attempt = 0) => {
    // ตรวจสอบเงื่อนไข 3 ข้อ
    const chartReady = typeof window.Chart === 'function';      // Chart.js โหลดเสร็จ?
    const canvasReady = !!document.getElementById('chartSdgTop'); // canvas มีอยู่ใน DOM?
    const pageVisible = !document.getElementById('mainApp')?.classList.contains('hidden'); // หน้า Dashboard กำลังแสดง?

    if (!chartReady || !canvasReady || !pageVisible) {
      // ถ้าเงื่อนไขไม่ผ่าน → ลองใหม่ในอีก 100ms
      if (attempt < 30) return setTimeout(() => tryRender(attempt + 1), 100);
      return;
    }

    // วาดกราฟ
    renderDashboardCharts();

    // Resize charts หลัง render
    requestAnimationFrame(() => {
      try {
        Object.values(charts || {}).forEach(c => {
          if (c && typeof c.resize === 'function') c.resize();
        });
      } catch {}
    });
  };

  // เริ่มลอง render
  requestAnimationFrame(() => setTimeout(() => tryRender(0), 0));
}

// ================================================================================
// ฟังก์ชัน: renderDashboardData
// ================================================================================
// เรนเดอร์ข้อมูลในตาราง
// 
// ทำ:
// 1. เติมข้อมูลในตารางสรุปตามหน่วยงาน
// 2. เติมข้อมูลในตารางสรุปตาม SDG
// ================================================================================
function renderDashboardData() {
  // ตาราง: สรุปตามหน่วยงาน
  const tableByOrg = document.getElementById('tableByOrg');
  const byOrgData = window._dashboardByOrg || [];
  tableByOrg.innerHTML = byOrgData
    .map(item => `
      <tr>
        <td class="font-medium">${item.orgName || getOrgName(item.orgId)}</td>
        <td class="text-right">${item.count}</td>
        <td class="text-right">${formatMoney(item.budget)} ฿</td>
      </tr>
    `).join('');

  // ตาราง: สรุปตาม SDG
  const tableBySdg = document.getElementById('tableBySdg');
  const bySdgData = window._dashboardBySdg || [];
  tableBySdg.innerHTML = bySdgData
    .map(item => {
      // หาสีของ SDG นี้
      const t = SDG_TARGETS.find(x => x.id === item.sdg);
      const colors = t ? getSoftBadgeColors(t.color) : { bg: '#94a3b8', text: '#fff' };
      return `
      <tr>
        <td>
          <span class="badge badge-sm" style="background: ${colors.bg}; color: ${colors.text};">
            ${item.sdg}
          </span>
        </td>
        <td class="text-right">${item.count}</td>
      </tr>
    `}).join('');
}

// ================================================================================
// ฟังก์ชัน: renderDashboardCharts
// ================================================================================
// วาดกราฟทั้ง 3 กราฟ
// 
// กราฟ 1: SDG ที่ใช้มากที่สุด 5 อันดับ
// กราฟ 2: จำนวน SDG ต่อโครงการ (1 SDG / หลาย SDG / ไม่ระบุ)
// กราฟ 3: การกระจายตามหมวดหมู่ SDG 4
// ================================================================================
function renderDashboardCharts() {
  const projects = DB.projects || [];

  // ========================================================================
  // กราฟ 1: SDG ที่ใช้มากที่สุด
  // ========================================================================
  // นับจำนวนโครงการต่อ SDG
  const sdgCount = {};
  projects.forEach(p => {
    (p.sdg || []).forEach(code => {
      sdgCount[code] = (sdgCount[code] || 0) + 1;
    });
  });
  
  // เรียงลำดับจากมากไปน้อย
  const sdgSorted = Object.entries(sdgCount).sort((a, b) => b[1] - a[1]);
  
  // เอาแค่ 5 อันดับแรก
  const topN = 5;
  const top = sdgSorted.slice(0, topN);
  
  // สร้าง labels และ values
  const sdgLabels = top.map(([code]) => {
    const meta = SDG_TARGETS.find(t => t.id === code);
    return meta ? `${code} - ${meta.label}` : code;
  });
  const sdgValues = top.map(([, v]) => v);
  
  // วาดกราฟ
  createDoughnutChart('chartSdgTop', { labels: sdgLabels, values: sdgValues }, ['#2563eb','#3b82f6','#6366f1','#8b5cf6','#a855f7','#94a3b8']);
  
  // แสดง KPI
  const top1 = sdgSorted[0];
  const top1Label = top1 ? (SDG_TARGETS.find(t => t.id === top1[0]) ? top1[0] : top1[0]) : '-';
  const top1Count = top1 ? top1[1] : 0;
  const kpiSdgTop = document.getElementById('kpiSdgTop');
  if (kpiSdgTop) kpiSdgTop.textContent = top1 ? `${top1Label} (${top1Count})` : '-';

  // ========================================================================
  // กราฟ 2: จำนวน SDG ต่อโครงการ
  // ========================================================================
  let single = 0, multi = 0, none = 0;
  projects.forEach(p => {
    const n = (p.sdg || []).length;
    if (n === 0) none++;
    else if (n === 1) single++;
    else multi++;
  });
  createDoughnutChart(
    'chartSdgMulti',
    { labels: ['แท็ก 1 SDG', 'แท็กหลาย SDG', 'ไม่ระบุ SDG'], values: [single, multi, none] },
    ['#16a34a', '#2563eb', '#94a3b8']
  );
  
  // แสดง KPI: % ของโครงการที่มีหลาย SDG
  const kpiMultiPct = document.getElementById('kpiMultiPct');
  if (kpiMultiPct) {
    const denom = Math.max(1, single + multi + none);
    const pct = Math.round((multi / denom) * 100);
    kpiMultiPct.textContent = `${pct}%`;
  }

  // ========================================================================
  // กราฟ 3: การกระจายตามหมวดหมู่ SDG 4
  // ========================================================================
  // กำหนดหมวดหมู่
  const groups = [
    { id: 'access', label: 'คุณภาพการศึกษาในทุกระดับ', codes: new Set(['4.1','4.2','4.3']) },
    { id: 'skills', label: 'ทักษะ/อาชีพ', codes: new Set(['4.4']) },
    { id: 'equity', label: 'ความเสมอภาค/กลุ่มเปราะบาง', codes: new Set(['4.5']) },
    { id: 'literacy', label: 'ทักษะพื้นฐาน/พลเมืองโลก', codes: new Set(['4.6','4.7']) },
    { id: 'enablers', label: 'ระบบสนับสนุน (สถานศึกษา/ครู)', codes: new Set(['4.a','4.c']) },
    { id: 'scholarships', label: 'ทุนการศึกษา', codes: new Set(['4.b']) },
  ];
  
  // นับจำนวนต่อหมวดหมู่
  const groupCount = {};
  groups.forEach(g => groupCount[g.id] = 0);
  let unclassified = 0;
  projects.forEach(p => {
    (p.sdg || []).forEach(code => {
      const g = groups.find(x => x.codes.has(code));
      if (g) groupCount[g.id]++;
      else unclassified++;
    });
  });
  
  // สร้าง pairs สำหรับกราฟ (กรองเอาที่มี count > 0)
  const groupPairs = groups.map(g => [g, groupCount[g.id]]).filter(([, v]) => v > 0);
  if (unclassified > 0) groupPairs.push([{ id: 'other', label: 'อื่นๆ' }, unclassified]);
  
  // วาดกราฟ
  const groupLabels = groupPairs.map(([g]) => g.label);
  const groupValues = groupPairs.map(([, v]) => v);
  createDoughnutChart('chartSdgGroups', { labels: groupLabels, values: groupValues }, ['#2563eb','#16a34a','#f59e0b','#3b82f6','#eab308','#ef4444','#94a3b8']);
  
  // แสดง KPI: หมวดหมู่ที่มากที่สุด
  const topGroup = groupPairs.sort((a,b) => b[1]-a[1])[0];
  const kpiTopGroup = document.getElementById('kpiTopGroup');
  if (kpiTopGroup) kpiTopGroup.textContent = topGroup ? `${topGroup[0].label} (${topGroup[1]})` : '-';
}

// ================================================================================
// ฟังก์ชัน: createDoughnutChart
// ================================================================================
// สร้างกราฟ Doughnut
// 
// Args:
//   canvasId - ID ของ canvas element
//   data     - { labels: [...], values: [...] }
//   colors   - array ของสี
// ================================================================================
function createDoughnutChart(canvasId, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Destroy chart เก่าก่อน (ถ้ามี)
  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }

  // สร้างกราฟใหม่
  charts[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '70%' // ขนาดช่องว่างตรงกลาง
    }
  });
}

// ================================================================================
// ฟังก์ชัน: exportCSV
// ================================================================================
// เปิด Dialog สำหรับส่งออก CSV
// 
// Features:
// - เลือกโครงการที่จะส่งออก
// - เลือกคอลัมน์ที่ต้องการ
// - ดาวน์โหลดเป็นไฟล์ CSV
// ================================================================================
function exportCSV() {
  const projects = (DB?.projects || []).slice();

  // ========================================================================
  // Helper Functions
  // ========================================================================
  const sanitizeCell = (v) =>
    String(v ?? '')
      .replace(/\r?\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/"/g, '""')
      .trim();

  const durationOf = (p) => {
    const parts = [p.startDate, p.endDate].filter(Boolean);
    return parts.join(' - ');
  };
  
  const imageCountOf = (p) => String((p.images || []).length);

  // ========================================================================
  // Column Definitions
  // ========================================================================
  const COLUMNS = [
    { id: 'org', label: 'หน่วยงานหลัก', defaultSelected: true, get: (p) => getOrgName(p.orgId) },
    { id: 'title', label: 'ชื่อโครงการ', defaultSelected: true, get: (p) => p.title ?? '' },
    { id: 'budget', label: 'งบประมาณ (บาท)', defaultSelected: true, get: (p) => p.budget ?? '' },
    { id: 'objective', label: 'วัตถุประสงค์ของโครงการ', defaultSelected: true, get: (p) => p.objective ?? '' },
    { id: 'duration', label: 'ระยะเวลาในการดำเนินงาน', defaultSelected: true, get: (p) => durationOf(p) },
    { id: 'policy', label: 'ข้อเสนอแนะเชิงนโยบาย', defaultSelected: true, get: (p) => p.policy ?? '' },
    { id: 'owner', label: 'ผู้รับผิดชอบ', defaultSelected: true, get: (p) => p.owner ?? '' },
    { id: 'sdg', label: 'SDG targets', defaultSelected: true, get: (p) => (p.sdg || []).join(', ') },
    { id: 'imageCount', label: 'จำนวนรูป', defaultSelected: true, get: (p) => imageCountOf(p) },
    { id: 'year', label: 'ปีงบประมาณ', defaultSelected: false, get: (p) => p.year ?? '' },
    { id: 'startDate', label: 'วันเริ่ม', defaultSelected: false, get: (p) => p.startDate ?? '' },
    { id: 'id', label: 'ID', defaultSelected: false, get: (p) => p.id ?? '' },
    { id: 'endDate', label: 'วันสิ้นสุด', defaultSelected: false, get: (p) => p.endDate ?? '' },
  ];

  // ========================================================================
  // Build CSV
  // ========================================================================
  const buildExports = (selectedColIds, selectedProjectIds) => {
    const selectedCols = COLUMNS.filter(c => selectedColIds.includes(c.id));
    const header = selectedCols.map(c => c.label);
    const chosenProjects = selectedProjectIds?.length
      ? projects.filter(p => selectedProjectIds.includes(p.id))
      : projects;
    const rows = chosenProjects.map(p => selectedCols.map(c => c.get(p)));
    const csvEscape = (v) => `"${sanitizeCell(String(v ?? ''))}"`;
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
    return { header, rows, csv, selectedColIds, selectedProjectIds, rowCount: chosenProjects.length };
  };

  // Default: เลือกทุกคอลัมน์และทุกโครงการ
  const defaultSelectedColIds = COLUMNS.filter(c => c.defaultSelected).map(c => c.id);
  const defaultSelectedProjectIds = projects.map(p => p.id);
  let lastExport = buildExports(defaultSelectedColIds, defaultSelectedProjectIds);

  const countLabel = `รวม ${projects.length} โครงการ (ทุกหน่วยงาน)`;

  // ========================================================================
  // SweetAlert Dialog
  // ========================================================================
  Swal.fire({
    title: 'ส่งออกข้อมูลโครงการ',
    html: `
      <div class="text-left space-y-4">
        <p class="text-sm text-gray-600">${countLabel} กรุณาเลือกโครงการและคอลัมน์ที่ต้องการส่งออก</p>

        <!-- เลือกโครงการ -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div class="flex flex-wrap gap-2 items-center justify-between mb-2">
            <span class="font-semibold text-gray-700">เลือกโครงการ</span>
            <div class="flex gap-2">
              <button type="button" id="btnExportAllRows" class="btn btn-xs btn-outline btn-ghost">เลือกทั้งหมด</button>
              <button type="button" id="btnExportNoRows" class="btn btn-xs btn-outline btn-ghost">ไม่เลือกเลย</button>
            </div>
          </div>
          <input id="exportProjectSearch" class="input input-bordered input-sm w-full" placeholder="ค้นหาโครงการ" />
          <div id="exportProjects" class="mt-3 max-h-44 overflow-auto border border-gray-200 rounded-lg bg-white p-2 space-y-1"></div>
          <p class="text-xs text-gray-500 mt-2">ค่าเริ่มต้น: ส่งออกทุกโครงการ</p>
        </div>

        <!-- เลือกคอลัมน์ -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div class="flex flex-wrap gap-2 items-center justify-between mb-2">
            <span class="font-semibold text-gray-700">เลือกคอลัมน์</span>
            <div class="flex gap-2">
              <button type="button" id="btnExportAllCols" class="btn btn-xs btn-outline btn-ghost">เลือกทั้งหมด</button>
              <button type="button" id="btnExportNoCols" class="btn btn-xs btn-outline btn-ghost">ไม่เลือกเลย</button>
              <button type="button" id="btnExportResetCols" class="btn btn-xs btn-outline btn-ghost">รีเซ็ตค่าเริ่มต้น</button>
            </div>
          </div>
          <div id="exportCols" class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3"></div>
          <p class="text-xs text-gray-500 mt-2">ค่าเริ่มต้น: คอลัมน์ตามแบบฟอร์มมาตรฐาน</p>
        </div>

        <button type="button" id="btnDownloadCsv" class="btn btn-primary w-full sm:w-auto gap-2">
          <i class="fas fa-file-csv"></i>
          ดาวน์โหลดไฟล์ CSV
        </button>
        <p class="text-xs text-gray-500">หมายเหตุ: ข้อมูลรูปภาพจะแสดงเป็นจำนวนรูปที่แนบในระบบ ไม่ส่งออกไฟล์รูปภาพ</p>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    width: '560px',
    
    didOpen: () => {
      // ========================================================================
      // Render Column Checkboxes
      // ========================================================================
      const colsWrap = document.getElementById('exportCols');
      if (colsWrap) {
        colsWrap.innerHTML = COLUMNS.map(c => `
          <label class="flex items-start gap-2 cursor-pointer hover:bg-base-200/50 rounded p-1 -m-1">
            <input type="checkbox" class="checkbox checkbox-sm mt-0.5" data-col="${c.id}" ${c.defaultSelected ? 'checked' : ''}/>
            <span class="text-sm">${c.label}</span>
          </label>
        `).join('');
      }

      // ========================================================================
      // Render Project Checkboxes
      // ========================================================================
      const projWrap = document.getElementById('exportProjects');
      let selectedPids = new Set(projects.map(p => p.id));
      
      const renderProjectList = (q = '') => {
        if (!projWrap) return;
        
        // เก็บค่าที่เลือกอยู่ก่อน
        const existing = document.querySelectorAll('#exportProjects input[type="checkbox"][data-pid]');
        if (existing.length > 0) {
          selectedPids = new Set(
            Array.from(existing).filter(el => el.checked).map(el => el.getAttribute('data-pid'))
          );
        }
        
        // Filter ตามคำค้นหา
        const query = (q || '').trim().toLowerCase();
        const filtered = projects.filter(p => {
          const title = String(p.title || '').toLowerCase();
          const org = String(getOrgName(p.orgId) || '').toLowerCase();
          return !query || title.includes(query) || org.includes(query);
        });
        
        if (filtered.length === 0) {
          projWrap.innerHTML = '<div class="text-sm text-gray-500 p-2">ไม่พบโครงการ</div>';
          return;
        }
        
        projWrap.innerHTML = filtered.map(p => {
          const orgName = getOrgName(p.orgId);
          const checked = selectedPids.has(p.id);
          return `
            <label class="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 block">
              <input type="checkbox" class="checkbox checkbox-sm mt-0.5" data-pid="${p.id}" ${checked ? 'checked' : ''} />
              <span class="text-sm flex-1 min-w-0">
                <span class="font-medium block truncate">${(p.title || '-').replace(/</g, '&lt;')}</span>
                <span class="text-xs text-gray-500">${(orgName || '-').replace(/</g, '&lt;')}</span>
              </span>
            </label>
          `;
        }).join('');
      };
      renderProjectList('');

      // ========================================================================
      // Helper Functions
      // ========================================================================
      const getSelectedColIds = () =>
        Array.from(document.querySelectorAll('#exportCols input[type="checkbox"][data-col]'))
          .filter(el => el.checked)
          .map(el => el.getAttribute('data-col'));
      const getSelectedProjectIds = () =>
        Array.from(document.querySelectorAll('#exportProjects input[type="checkbox"][data-pid]'))
          .filter(el => el.checked)
          .map(el => el.getAttribute('data-pid'));

      const updatePreview = () => {
        const selectedColIds = getSelectedColIds();
        const selectedProjectIds = getSelectedProjectIds();
        if (!selectedColIds.length || !selectedProjectIds.length) {
          lastExport = { csv: '', selectedColIds, selectedProjectIds };
          return;
        }
        lastExport = buildExports(selectedColIds, selectedProjectIds);
      };

      // ========================================================================
      // Event Listeners
      // ========================================================================
      document.getElementById('exportCols')?.addEventListener('change', updatePreview);
      document.getElementById('exportProjects')?.addEventListener('change', updatePreview);
      document.getElementById('exportProjectSearch')?.addEventListener('input', (e) => {
        renderProjectList(e.target.value);
        updatePreview();
      });

      // Column buttons
      document.getElementById('btnExportAllCols')?.addEventListener('click', () => {
        document.querySelectorAll('#exportCols input[type="checkbox"][data-col]').forEach(el => { el.checked = true; });
        updatePreview();
      });
      document.getElementById('btnExportNoCols')?.addEventListener('click', () => {
        document.querySelectorAll('#exportCols input[type="checkbox"][data-col]').forEach(el => { el.checked = false; });
        updatePreview();
      });
      document.getElementById('btnExportResetCols')?.addEventListener('click', () => {
        document.querySelectorAll('#exportCols input[type="checkbox"][data-col]').forEach(el => {
          const col = COLUMNS.find(c => c.id === el.getAttribute('data-col'));
          el.checked = !!col?.defaultSelected;
        });
        updatePreview();
      });

      // Project buttons
      document.getElementById('btnExportAllRows')?.addEventListener('click', () => {
        document.querySelectorAll('#exportProjects input[type="checkbox"][data-pid]').forEach(el => { el.checked = true; });
        updatePreview();
      });
      document.getElementById('btnExportNoRows')?.addEventListener('click', () => {
        document.querySelectorAll('#exportProjects input[type="checkbox"][data-pid]').forEach(el => { el.checked = false; });
        updatePreview();
      });

      // Download button
      document.getElementById('btnDownloadCsv')?.addEventListener('click', () => {
        if (!lastExport?.rows?.length || !lastExport?.header?.length) {
          showWarning('ไม่สามารถดาวน์โหลดได้', 'กรุณาเลือกอย่างน้อย 1 โครงการ และ 1 คอลัมน์');
          return;
        }
        const csvContent = lastExport.csv || '';
        if (!csvContent) {
          showError('ไม่สามารถส่งออกข้อมูลได้', 'ไม่มีข้อมูลที่จะส่งออก');
          return;
        }
        // BOM for UTF-8 Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sdg4_projects_export.csv';
        a.click();
        URL.revokeObjectURL(a.href);
        showSuccess('ดาวน์โหลดสำเร็จ', 'ไฟล์ CSV ถูกดาวน์โหลดแล้ว');
      });
    },
  });
}
