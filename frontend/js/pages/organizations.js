/**
 * ================================================================================
 * Organizations Page - หน้าจัดการหน่วยงาน (Admin)
 * ================================================================================
 * 
 * ไฟล์นี้จัดการหน้าจัดการหน่วยงานสำหรับ Admin
 * 
 * ================================================================================
 * ฟังก์ชัน:
 * ================================================================================
 * 
 * - renderOrganizations()     - แสดงหน้าจัดการหน่วยงาน
 * - renderOrganizationsView() - แสดงหน้าดูหน่วยงาน (สำหรับ Manager)
 * - openOrgModal()          - เปิด modal สร้าง/แก้ไขหน่วยงาน
 * - saveOrg()               - บันทึกหน่วยงาน
 * - deleteOrg()             - ลบหน่วยงาน
 * - toggleOrgStatus()       - เปิด/ปิดใช้งานหน่วยงาน
 * 
 * ================================================================================
 * สิทธิ์การเข้าถึง:
 * ================================================================================
 * 
 * - Admin: เห็นและจัดการหน่วยงานทั้งหมด
 * - Manager: เห็นเฉพาะรายชื่อหน่วยงาน (view-only)
 * 
 * ================================================================================
 */

// ==================== Organizations Page ====================
function renderOrganizations() {
  const content = document.getElementById('pageContent');

  content.innerHTML = `
    <div class="page">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">จัดการหน่วยงาน</h1>
          <p class="text-gray-500 mt-2">เพิ่ม แก้ไข หรือจัดการหน่วยงานในระบบ</p>
        </div>
        <button onclick="openOrgModal()" class="btn btn-outline gap-2 whitespace-nowrap">
          <i class="fas fa-plus-circle"></i>
          <span class="hidden sm:inline">เพิ่มหน่วยงาน</span>
          <span class="sm:hidden">เพิ่ม</span>
        </button>
      </div>

      <div class="stat-card">
        <div class="overflow-x-auto">
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th class="min-w-[200px]">ชื่อหน่วยงาน</th>
                <th class="whitespace-nowrap">สถานะ</th>
                <th class="whitespace-nowrap">โครงการ</th>
                <th class="text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${DB.orgs.map(org => {
                const projectCount = DB.projects.filter(p => p.orgId === org.id).length;
                return `
                  <tr>
                    <td>
                      <div>
                        <div class="font-semibold">${org.name}</div>
                      </div>
                    </td>
                    <td>
                      <span class="text-sm whitespace-nowrap flex items-center gap-1.5">
                        <i class="fas fa-${org.active ? 'check-circle' : 'times-circle'} ${org.active ? 'text-green-600' : 'text-red-600'}" style="font-size: 0.875rem;"></i>
                        <span class="${org.active ? 'text-green-600' : 'text-red-600'} font-medium">${org.active ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
                      </span>
                    </td>
                    <td>
                      <span class="text-sm text-gray-700 whitespace-nowrap font-medium">
                        ${projectCount} รายการ
                      </span>
                    </td>
                    <td>
                      <div class="flex gap-1.5 justify-end">
                        <button class="btn btn-sm btn-ghost whitespace-nowrap text-gray-700 hover:text-gray-900 hover:bg-gray-100" onclick="editOrg('${org.id}')" title="แก้ไข">
                          <i class="fas fa-edit text-xs"></i>
                          <span class="hidden sm:inline ml-1.5 text-xs">แก้ไข</span>
                        </button>
                        <button class="btn btn-sm btn-ghost whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50" onclick="deleteOrg('${org.id}')" title="ลบ">
                          <i class="fas fa-trash text-xs"></i>
                          <span class="hidden sm:inline ml-1.5 text-xs">ลบ</span>
                        </button>
                        <button class="btn btn-sm btn-ghost whitespace-nowrap ${org.active ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}" 
                                onclick="toggleOrgStatus('${org.id}')" title="${org.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}">
                          <i class="fas fa-${org.active ? 'ban' : 'check'} text-xs"></i>
                          <span class="hidden sm:inline ml-1.5 text-xs">${org.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==================== Organizations View (Manager) ====================
function renderOrganizationsView() {
  const content = document.getElementById('pageContent');
  content.innerHTML = `
    <div class="page">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">หน่วยงานทั้งหมด</h1>
          <p class="text-gray-500 mt-2">ดูรายชื่อหน่วยงานในระบบ (ดูข้อมูลเท่านั้น)</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="overflow-x-auto">
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th class="min-w-[200px]">ชื่อหน่วยงาน</th>
                <th class="whitespace-nowrap">สถานะ</th>
                <th class="whitespace-nowrap">โครงการ</th>
              </tr>
            </thead>
            <tbody>
              ${DB.orgs.map(org => {
                const projectCount = DB.projects.filter(p => p.orgId === org.id).length;
                return `
                  <tr>
                    <td>
                      <div class="font-semibold">${org.name}</div>
                    </td>
                    <td>
                      <span class="text-sm whitespace-nowrap flex items-center gap-1">
                        <i class="fas fa-${org.active ? 'check-circle' : 'times-circle'} ${org.active ? 'text-green-600' : 'text-red-600'}"></i>
                        <span class="${org.active ? 'text-green-600' : 'text-red-600'}">${org.active ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
                      </span>
                    </td>
                    <td>
                      <span class="text-sm text-gray-600 whitespace-nowrap">
                        ${projectCount} รายการ
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function openOrgModal(orgId = null) {
  const org = orgId ? DB.orgs.find(o => o.id === orgId) : null;

  const { value: formValues } = await Swal.fire({
    title: org ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงานใหม่',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label class="block text-sm font-medium mb-2">ชื่อหน่วยงาน</label>
          <input id="swal-name" class="input input-bordered w-full" 
                 value="${org ? org.name : ''}" placeholder="ระบุชื่อหน่วยงาน">
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#2563eb',
    preConfirm: () => {
      const name = document.getElementById('swal-name').value.trim();
      if (!name) {
        Swal.showValidationMessage('กรุณาระบุชื่อหน่วยงาน');
        return false;
      }
      return { name };
    }
  });

  if (formValues) {
    try {
      if (org) {
        await api.updateOrg(org.id, { name: formValues.name });
        showSuccess('อัปเดตสำเร็จ', 'ข้อมูลหน่วยงานถูกอัปเดตแล้ว');
      } else {
        await api.createOrg(formValues.name);
        initLogin();
        showSuccess('เพิ่มสำเร็จ', 'หน่วยงานใหม่ถูกเพิ่มแล้ว');
      }
      await refreshFromApi();
    } catch (e) {
      showError('เกิดข้อผิดพลาด', e.message);
      return;
    }
    renderOrganizations();
  }
}

function editOrg(orgId) {
  openOrgModal(orgId);
}

async function toggleOrgStatus(orgId) {
  const org = DB.orgs.find(o => o.id === orgId);
  const action = org.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน';

  const ok = await confirm(
    `${action}หน่วยงาน`,
    `ต้องการ${action} "${org.name}" ใช่หรือไม่?`,
    action
  );

  if (ok) {
    try {
      await api.updateOrg(orgId, { active: !org.active });
      await refreshFromApi();
      initLogin();
      showSuccess(`${action}สำเร็จ`, `หน่วยงาน ${org.name} ถูก${action}แล้ว`);
    } catch (e) {
      showError('เกิดข้อผิดพลาด', e.message);
      return;
    }
    renderOrganizations();
  }
}

async function deleteOrg(orgId) {
  if (session?.role !== 'admin') return;
  const org = DB.orgs.find(o => o.id === orgId);
  if (!org) return;

  const projectCount = DB.projects.filter(p => p.orgId === orgId).length;

  if (projectCount > 0) {
    showError('ไม่สามารถลบได้', 'กรุณาลบโครงการที่เกี่ยวข้องก่อน');
    return;
  }

  const ok = await Swal.fire({
    title: 'ลบหน่วยงาน',
    html: `<p>ต้องการลบหน่วยงาน <strong>${org.name}</strong> ใช่หรือไม่?</p><p class="text-sm text-red-600 mt-2">การลบไม่สามารถย้อนกลับได้</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#d33'
  });

  if (!ok.isConfirmed) return;

  try {
    await api.deleteOrg(orgId);
    await refreshFromApi();
    showSuccess('ลบสำเร็จ', 'หน่วยงานถูกลบแล้ว');
    renderOrganizations();
  } catch (e) {
    showError('เกิดข้อผิดพลาด', e.message);
  }
}
