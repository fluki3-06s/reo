/**
 * ================================================================================
 * Users Page - หน้าตั้งค่า PIN หน่วยงาน (Admin)
 * ================================================================================
 * 
 * ไฟล์นี้จัดการหน้าตั้งค่า PIN สำหรับ Admin
 * 
 * ================================================================================
 * ฟังก์ชัน:
 * ================================================================================
 * 
 * - renderUsers()       - แสดงหน้าตั้งค่า PIN
 * - openPinModal()      - เปิด modal ตั้งค่า PIN
 * - savePin()           - บันทึก PIN ใหม่
 * - togglePinDisplay()   - แสดง/ซ่อน PIN
 * 
 * ================================================================================
 * หมายเหตุ:
 * ================================================================================
 * 
 * - Admin เท่านั้นที่เข้าถึงหน้านี้ได้
 * - Manager ไม่สามารถเปลี่ยน PIN ได้
 * - PIN ใช้สำหรับ login ของ Manager
 * 
 * ================================================================================
 */

// ==================== Users Page (Admin) - PIN Management ====================
function renderUsers() {
  const content = document.getElementById('pageContent');
  if (session?.role !== 'admin') {
    content.innerHTML = '<div class="page"><div class="stat-card"><div class="alert alert-error"><i class="fas fa-ban"></i><span>เฉพาะผู้ดูแลระบบเท่านั้น</span></div></div></div>';
    return;
  }

  const orgs = (DB.orgs || []).slice();

  content.innerHTML = `
    <div class="page">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-bold text-gray-800">ตั้งค่า PIN หน่วยงาน</h1>
          <p class="text-gray-500 mt-2">สำหรับการเข้าสู่ระบบโดยเลือกหน่วยงานและระบุรหัส PIN 6 หลัก</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="overflow-x-auto">
          <table class="table w-full table-zebra">
            <thead>
              <tr>
                <th class="min-w-[200px]">หน่วยงาน</th>
                <th class="whitespace-nowrap">สถานะ</th>
                <th class="whitespace-nowrap min-w-[150px]">PIN</th>
                <th class="text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${orgs.map(org => `
                <tr>
                  <td class="font-medium">${org.name}</td>
                  <td>
                    <span class="text-sm whitespace-nowrap flex items-center gap-1.5">
                      <i class="fas fa-${org.active ? 'check-circle' : 'times-circle'} ${org.active ? 'text-green-600' : 'text-red-600'}" style="font-size: 0.875rem;"></i>
                      <span class="${org.active ? 'text-green-600' : 'text-red-600'} font-medium">${org.active ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
                    </span>
                  </td>
                  <td>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span class="text-sm text-gray-700 pin-display-${org.id}" data-pin="${org.pin || DEFAULT_ORG_PIN}">••••••</span>
                      <button class="btn btn-xs btn-ghost text-gray-500 hover:text-gray-700 ml-1" onclick="togglePinDisplay('${org.id}')" title="แสดงหรือซ่อน PIN">
                        <i class="fas fa-eye pin-eye-${org.id}"></i>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-1.5 justify-end">
                      <button class="btn btn-sm btn-ghost whitespace-nowrap text-gray-700 hover:text-gray-900 hover:bg-gray-100" onclick="setOrgPin('${org.id}')" title="ตั้งค่าหรือรีเซ็ต PIN">
                        <i class="fas fa-key text-xs"></i> <span class="hidden sm:inline ml-1.5 text-xs">ตั้ง/รีเซ็ต PIN</span><span class="sm:hidden text-xs">PIN</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function togglePinDisplay(orgId) {
  const pinDisplay = document.querySelector(`.pin-display-${orgId}`);
  const pinEye = document.querySelector(`.pin-eye-${orgId}`);
  if (!pinDisplay || !pinEye) return;

  const isVisible = pinDisplay.textContent !== '••••••';
  const actualPin = pinDisplay.getAttribute('data-pin') || '123456';

  if (isVisible) {
    pinDisplay.textContent = '••••••';
    pinEye.classList.remove('fa-eye-slash');
    pinEye.classList.add('fa-eye');
  } else {
    pinDisplay.textContent = actualPin;
    pinEye.classList.remove('fa-eye');
    pinEye.classList.add('fa-eye-slash');
  }
}

async function setOrgPin(orgId) {
  if (session?.role !== 'admin') return;
  const org = (DB.orgs || []).find(o => o.id === orgId);
  if (!org) return;

  const { value: pin } = await Swal.fire({
    title: 'ตั้งค่าหรือรีเซ็ต PIN หน่วยงาน',
    html: `
      <div class="text-left space-y-2">
        <p>หน่วยงาน: <strong>${org.name}</strong></p>
        <input id="swal-orgpin" class="input input-bordered w-full mt-3" type="password"
               placeholder="ระบุรหัส PIN ใหม่ (6 หลัก)" maxlength="6" inputmode="numeric">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#2563eb',
    preConfirm: () => {
      const p = document.getElementById('swal-orgpin').value.trim();
      if (!/^\d{6}$/.test(p)) {
        Swal.showValidationMessage('PIN ต้องเป็นตัวเลข 6 หลัก');
        return false;
      }
      return p;
    }
  });

  if (pin) {
    try {
      await api.setOrgPin(orgId, pin);
      await refreshFromApi();
      showSuccess('บันทึกสำเร็จ', 'PIN หน่วยงานถูกอัปเดตแล้ว');
    } catch (e) {
      showError('เกิดข้อผิดพลาด', e.message);
      return;
    }
    renderUsers();
  }
}
