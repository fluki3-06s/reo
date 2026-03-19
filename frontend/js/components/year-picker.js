/**
 * ================================================================================
 * Year Picker Component - ตัวเลือกปีงบประมาณ
 * ================================================================================
 * 
 * ไฟล์นี้สร้าง component สำหรับเลือกปีงบประมาณ
 * 
 * ================================================================================
 * การทำงาน:
 * ================================================================================
 * 
 * 1. เมื่อคลิก input ที่กำหนด
 *    → แสดง dropdown ปีให้เลือก
 * 
 * 2. Dropdown แสดงปี 9 ป� (ปีปัจจุบัน +/- 4)
 *    → สามารถกด << หรือ >> เพื่อเลื่อนไปช่วงปีอื่น
 * 
 * 3. เมื่อเลือกปี
 *    → อัปเดตค่าใน input
 *    → เรียก callback ถ้ามี
 *    → ปิด dropdown
 * 
 * ================================================================================
 * การใช้งาน:
 * ================================================================================
 * 
 * HTML:
 * <input type="text" id="myYear" placeholder="เลือกปี" onclick="openYearPicker('myYear')" readonly>
 * <input type="hidden" id="myYearValue">
 * 
 * JavaScript:
 * openYearPicker('myYear', () => {
 *   console.log('เลือกปีเสร็จแล้ว');
 * });
 * 
 * ================================================================================
 * หมายเหตุ:
 * ================================================================================
 * - ใช้ปีพุทธศิริ (Buddhist Era) = ค.ศ. + 543
 * - ช่วงปี: 2500 - 3000
 * ================================================================================
 */

// ================================================================================
// ฟังก์ชัน: openYearPicker
// ================================================================================
// เปิด Year Picker Dropdown
// 
// Args:
//   inputId  - ID ของ input ที่จะแสดงปีที่เลือก
//   callback - function ที่จะเรียกเมื่อเลือกปีเสร็จ (optional)
// ================================================================================
function openYearPicker(inputId, callback) {
  // ปิด dropdown ที่เปิดอยู่ก่อน (ถ้ามี)
  closeYearPicker();

  // ค้นหา input element
  const input = document.getElementById(inputId);
  if (!input) return;

  // ค้นหา hidden input สำหรับเก็บค่าปี (ถ้ามี)
  const hiddenInput = document.getElementById(inputId + 'Value');
  
  // ดึงค่าปีปัจจุบันจาก hidden input
  // ถ้าไม่มี → ใช้ null
  const currentYear = hiddenInput ? Number(hiddenInput.value) : null;

  // สร้าง dropdown element
  const picker = document.createElement('div');
  picker.className = 'year-picker-dropdown';
  picker.id = 'yearPickerDropdown';

  // ========================================================================
  // Year Range Configuration
  // ========================================================================
  // ช่วงปีที่ให้เลือก: 2500 - 3000 (พุทธศิริ)
  const startYear = 2500;
  const endYear = 3000;
  
  // ปีที่จะแสดงใน dropdown ตอนเปิด
  // ถ้าไม่มี currentYear → ใช้ปีปัจจุบัน + 543 (พุทธศิริ)
  let currentViewYear = currentYear || new Date().getFullYear() + 543;
  
  // ตรวจสอบว่าอยู่ในช่วงที่กำหนดหรือไม่
  if (currentViewYear < startYear) currentViewYear = startYear;
  if (currentViewYear > endYear) currentViewYear = endYear;

  // ========================================================================
  // ฟังก์ชัน: renderYearPicker
  // ========================================================================
  // วาด dropdown ปี
  // 
  // Args:
  //   year - ปีที่จะแสดง (เป็น center)
  // ========================================================================
  function renderYearPicker(year) {
    // สร้าง array ของปีที่จะแสดง (9 ปี)
    // แสดง year-4 ถึง year+4
    // ตัวอย่าง: ถ้า year = 2569 → แสดง 2565-2573
    const years = [];
    const start = year - 4;
    const end = year + 4;

    for (let y = start; y <= end; y++) {
      years.push(y);
    }

    // ========================================================================
    // สร้าง HTML สำหรับ dropdown
    // ========================================================================
    picker.innerHTML = `
      <div class="year-picker-header">
        <span class="year-picker-nav" onclick="event.stopPropagation(); navigateYearPicker(${year - 9});">‹‹</span>
        <span class="font-semibold">${year}</span>
        <span class="year-picker-nav" onclick="event.stopPropagation(); navigateYearPicker(${year + 9});">››</span>
      </div>
      <div class="year-picker-grid">
        ${years.map(y => `
          <div class="year-picker-item ${y === currentYear ? 'selected' : ''}" 
               onclick="event.stopPropagation(); selectYear(${y}, '${inputId}', ${callback ? 'true' : 'false'});">
            ${y}
          </div>
        `).join('')}
      </div>
    `;

    // เพิ่ม dropdown เข้าไปใน parent element
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(picker);
  }

  // ========================================================================
  // ตัวแปร dataset สำหรับเก็บ viewYear ปัจจุบัน
  // ========================================================================
  picker.dataset.viewYear = currentViewYear;

  // ========================================================================
  // ฟังก์ชัน: navigateYearPicker (global)
  // ========================================================================
  // เรียกจาก onclick ใน HTML
  // 
  // เลื่อน dropdown ไปช่วงปีใหม่
  // ========================================================================
  window.navigateYearPicker = function(newYear) {
    picker.dataset.viewYear = newYear;
    renderYearPicker(newYear);
  };

  // ========================================================================
  // ฟังก์ชัน: selectYear (global)
  // ========================================================================
  // เรียกจาก onclick ใน HTML
  // 
  // เมื่อผู้ใช้เลือกปี
  // ========================================================================
  window.selectYear = function(year, id, hasCallback) {
    const yearInput = document.getElementById(id);
    const yearValueInput = document.getElementById(id + 'Value');

    // อัปเดตค่าใน input (ทั้ง text และ hidden)
    if (yearInput) yearInput.value = year;
    if (yearValueInput) yearValueInput.value = year;

    // ปิด dropdown
    closeYearPicker();

    // เรียก callback ถ้ามี
    if (hasCallback && callback) {
      callback();
    }
  };

  // แสดง dropdown ครั้งแรก
  renderYearPicker(currentViewYear);

  // ========================================================================
  // Event: หยุด propagation ของ click บน dropdown
  // ========================================================================
  // ทำให้ click บน dropdown ไม่ trigger close dropdown
  // ========================================================================
  picker.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // ========================================================================
  // Event: ปิด dropdown เมื่อคลิกนอก dropdown
  // ========================================================================
  // ใช้ setTimeout เพื่อให้ event listener ทำงานหลังจาก click ที่เปิด dropdown
  // ========================================================================
  setTimeout(() => {
    const closeHandler = function(e) {
      // ถ้า click นอก dropdown และไม่ใช่ click บน input
      if (!picker.contains(e.target) && e.target !== input && !input.contains(e.target)) {
        closeYearPicker();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 100);
}

// ================================================================================
// ฟังก์ชัน: closeYearPicker
// ================================================================================
// ปิด Year Picker Dropdown
// ================================================================================
function closeYearPicker() {
  // ค้นหาและลบ dropdown ถ้ามี
  const picker = document.getElementById('yearPickerDropdown');
  if (picker) {
    picker.remove();
  }
  
  // ลบ global functions ที่สร้างไว้
  delete window.navigateYearPicker;
  delete window.selectYear;
}
