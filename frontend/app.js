// ==================== Data Store ====================
const LS_KEY = 'sdg4_data_v3';
const SESSION_KEY = 'sdg4_session_v3';
const SCHEMA_VERSION = 5;

const SDG_TARGETS = [
  { id:'4.1', label:'ประถม-มัธยมคุณภาพ', color:'#FF6B6B' },
  { id:'4.2', label:'ปฐมวัยคุณภาพ', color:'#4ECDC4' },
  { id:'4.3', label:'อาชีวะ-อุดมศึกษา', color:'#45B7D1' },
  { id:'4.4', label:'ทักษะเทคนิค/อาชีพ', color:'#FFA07A' },
  { id:'4.5', label:'ลดความเหลื่อมล้ำ', color:'#98D8C8' },
  { id:'4.6', label:'อ่านออกเขียนได้', color:'#6C5CE7' },
  { id:'4.7', label:'ความยั่งยืน', color:'#00B894' },
  { id:'4.a', label:'สถานศึกษาปลอดภัย', color:'#FDCB6E' },
  { id:'4.b', label:'ทุนการศึกษา', color:'#E17055' },
  { id:'4.c', label:'เพิ่มครูมีคุณวุฒิ', color:'#74B9FF' },
];

const DEFAULT_ORG_PIN = '123456';

const DEFAULT_ORGS = [
  { id: 'org-001', name: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน', active: true },
  { id: 'org-002', name: 'สพป.นม.1', active: true },
  { id: 'org-003', name: 'สพป.นม.2', active: true },
  { id: 'org-004', name: 'สพป.นม.3', active: true },
  { id: 'org-005', name: 'สพป.นม.4', active: true },
  { id: 'org-006', name: 'สพป.นม.5', active: true },
  { id: 'org-007', name: 'สพป.นม.6', active: true },
  { id: 'org-008', name: 'สพป.นม.7', active: true },
  { id: 'org-009', name: 'สพป.นม.', active: true },
  { id: 'org-010', name: 'ศูนย์การศึกษาพิเศษ เขตการศึกษา 11 จังหวัดนครราชสีมา', active: true },
  { id: 'org-011', name: 'โรงเรียนนครราชสีมาปัญญานุกูล', active: true },
  { id: 'org-012', name: 'สำนักงานอาชีวศึกษาจังหวัดนครราชสีมา', active: true },
  { id: 'org-013', name: 'สำนักงานคณะกรรมการส่งเสริมการศึกษาเอกชน', active: true },
  { id: 'org-014', name: 'สำนักงานส่งเสริมการเรียนรู้จังหวัดนครราชสีมา', active: true },
  { id: 'org-015', name: 'สำนักงานส่งเสริมการปกครองท้องถิ่นจังหวัดนครราชสีมา', active: true },
  { id: 'org-016', name: 'สำนักงานพระพุทธศาสนาจังหวัดนครราชสีมา', active: true },
  { id: 'org-017', name: 'วิทยาลัยนาฏศิลปนครราชสีมา', active: true },
  { id: 'org-018', name: 'กระทรวงอุดมศึกษา วิทยาศาสตร์ วิจัย และนวัตกรรม', active: true },
  { id: 'org-019', name: 'โรงเรียนสาธิตมหาวิทยาลัยราชภัฏนครราชสีมา', active: true },
  { id: 'org-020', name: 'โรงเรียนสุรวิวัฒน์ มหาวิทยาลัยเทคโนโลยีสุรนารี', active: true },
  { id: 'org-021', name: 'มหาวิทยาลัยเทคโนโลยีสุรนารี', active: true },
  { id: 'org-022', name: 'มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน', active: true },
  { id: 'org-023', name: 'มหาวิทยาลัยราชภัฏนครราชสีมา', active: true },
  { id: 'org-024', name: 'มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย วิทยาเขตนครราชสีมา', active: true },
  { id: 'org-025', name: 'วิทยาลัยศาสนศาสตร์นครราชสีมา มหาวิทยาลัยมหามกุฏราชวิทยาลัย', active: true },
  { id: 'org-026', name: 'มหาวิทยาลัยรามคำแหง สาขาวิทยาบริการเฉลิมพระเกียรตินครราชสีมา', active: true },
  { id: 'org-027', name: 'สถาบันบัณฑิตพัฒนบริหารศาสตร์ คณะรัฐประศาสนศาสตร์ ฯ', active: true },
  { id: 'org-028', name: 'มหาวิทยาลัยวงษ์ชวลิตกุล', active: true },
  { id: 'org-029', name: 'วิทยาลัยนครราชสีมา', active: true },
  { id: 'org-030', name: 'วิทยาลัยเทคโนโลยีพนมวันท์', active: true },
  { id: 'org-031', name: 'วิทยาลัยพยาบาลบรมราชชนนีนครราชสีมา', active: true },
  { id: 'org-032', name: 'สำนักงานพัฒนาสังคมและความมั่นคงของมนุษย์จังหวัดนครราชสีมา', active: true },
  { id: 'org-033', name: 'สำนักงานสาธารณสุขจังหวัดนครราชสีมา', active: true },
  { id: 'org-034', name: 'สำนักงานสถิติจังหวัดนครราชสีมา', active: true },
  { id: 'org-035', name: 'สำนักงานศึกษาธิการจังหวัดนครราชสีมา', active: true },
];

    const defaultData = () => ({
      schemaVersion: SCHEMA_VERSION,
      orgs: DEFAULT_ORGS.map(o => ({ ...o, pin: DEFAULT_ORG_PIN })),
      users: [
        { id: 'u-admin', username: 'admin', password: '999999', role: 'admin', active: true },
        ...DEFAULT_ORGS.map(o => ({
          id: `u-mgr-${o.id}`,
          username: `mgr-${o.id}`,
          password: DEFAULT_ORG_PIN,
          role: 'manager',
          orgId: o.id,
          active: true
        }))
      ],
      projects: [
        {
          id: 'p-1',
          orgId: 'org-023',
          title: 'โครงการพัฒนาทักษะดิจิทัลสำหรับครู',
          budget: 250000,
          objective: 'ยกระดับทักษะการสอนแบบดิจิทัลของครูในศตวรรษที่ 21',
          startDate: '2025-01-15',
          endDate: '2025-06-30',
          policy: 'สนับสนุนนโยบาย Thailand 4.0 และการศึกษาดิจิทัล',
          owner: 'ดร.สมชาย ใจดี',
          year: 2568,
          sdg: ['4.4','4.c'],
          images: [],
          createdAt: Date.now() - 1000*60*60*24*20,
          updatedAt: Date.now() - 1000*60*60*24*5,
          updatedBy: 'admin'
        },
        {
          id: 'p-2',
          orgId: 'org-002',
          title: 'โครงการส่งเสริมการอ่านออกเขียนได้',
          budget: 180000,
          objective: 'พัฒนาทักษะการอ่านและการเขียนของนักเรียนระดับประถมศึกษา',
          startDate: '2025-02-01',
          endDate: '2025-07-31',
          policy: 'รองรับนโยบายการศึกษาเพื่อคุณภาพชีวิต',
          owner: 'ครูสมหญิง รักการสอน',
          year: 2568,
          sdg: ['4.1','4.6'],
          images: [],
          createdAt: Date.now() - 1000*60*60*24*15,
          updatedAt: Date.now() - 1000*60*60*24*3,
          updatedBy: 'mgr-org-002'
        },
        {
          id: 'p-20',
          orgId: 'org-002',
          title: 'โครงการพัฒนาการอ่านออกเขียนได้',
          budget: 160000,
          objective: 'พัฒนาทักษะการอ่านและการเขียนของนักเรียน',
          startDate: '2025-03-10',
          endDate: '2025-08-31',
          policy: 'ส่งเสริมทักษะพื้นฐานทางการศึกษา',
          owner: 'ครูสมหญิง รักการสอน',
          year: 2568,
          sdg: ['4.6'],
          images: [],
          createdAt: Date.now() - 1000*60*60*24*25,
          updatedAt: Date.now() - 1000*60*60*24*5,
          updatedBy: 'mgr-org-002'
        },
        {
          id: 'p-21',
          orgId: 'org-023',
          title: 'โครงการส่งเสริมสถานศึกษาปลอดภัย',
          budget: 220000,
          objective: 'สร้างสภาพแวดล้อมที่ปลอดภัยในสถานศึกษา',
          startDate: '2025-02-20',
          endDate: '2025-07-20',
          policy: 'ส่งเสริมความปลอดภัยในสถานศึกษา',
          owner: 'ดร.สมชาย ใจดี',
          year: 2568,
          sdg: ['4.a'],
          images: [],
          createdAt: Date.now() - 1000*60*60*24*35,
          updatedAt: Date.now() - 1000*60*60*24*9,
          updatedBy: 'admin'
        },
        {
          id: 'p-22',
          orgId: 'org-012',
          title: 'โครงการพัฒนาทักษะอาชีพ',
          budget: 280000,
          objective: 'พัฒนาทักษะอาชีพให้กับเยาวชน',
          startDate: '2025-04-01',
          endDate: '2025-10-31',
          policy: 'ส่งเสริมการพัฒนาทักษะอาชีพ',
          owner: 'ผู้รับผิดชอบ',
          year: 2568,
          sdg: ['4.4'],
          images: [],
          createdAt: Date.now() - 1000*60*60*24*22,
          updatedAt: Date.now() - 1000*60*60*24*4,
          updatedBy: 'mgr-org-012'
        }
      ],
      audit: []
    });

let DB = migrateData(loadData());
DB = ensureOrgPins(DB);
DB = seedDemoProjectsB(DB);
let session = migrateSession(loadSession());
let charts = {};
let lastExport = null;

function syncNavHeight() {
  const nav = document.querySelector('.navbar-custom');
  if (!nav) return;
  const h = Math.max(56, nav.getBoundingClientRect().height || 0);
  document.documentElement.style.setProperty('--nav-h', `${Math.round(h)}px`);
}

function loadData() {
      const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const data = defaultData();
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return data;
      }
      try { return JSON.parse(raw); }
      catch {
    const data = defaultData();
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return data; 
  }
}

function migrateData(db) {
  if (!db || typeof db !== 'object') return defaultData();
  if (db.schemaVersion === SCHEMA_VERSION) return db;

  // v2 (PIN-based) -> v3 (user-based)
  if (!db.schemaVersion || db.schemaVersion < 3) {
    db.orgs = Array.isArray(db.orgs) ? db.orgs : [];
    db.projects = Array.isArray(db.projects) ? db.projects : [];
    db.users = Array.isArray(db.users) ? db.users : [];
    db.audit = Array.isArray(db.audit) ? db.audit : [];

    const adminPwd = (db.adminPin || '999999').toString();
    if (!db.users.some(u => u.role === 'admin')) {
      db.users.unshift({ id: 'u-admin', username: 'admin', password: adminPwd, role: 'admin', active: true });
    }

    db.orgs.forEach((org, idx) => {
      if (!org?.id) return;
      const uname = `mgr-${org.id}`;
      const exists = db.users.some(u => u.role === 'manager' && u.orgId === org.id);
      if (!exists) {
        const fallbackPin = String((idx + 1) * 111111).padStart(6, '0').slice(0, 6);
        const pwd = (org.pin || fallbackPin || '123456').toString();
        db.users.push({ id: `u-${uname}`, username: uname, password: pwd, role: 'manager', orgId: org.id, active: true });
      }
      if ('pin' in org) delete org.pin;
    });

    if ('adminPin' in db) delete db.adminPin;

    db.projects.forEach(p => {
      if (!p || typeof p !== 'object') return;
      // Draft/Ready system removed
      if ('status' in p) delete p.status;
      if (!p.year) p.year = 2568;
      if (!p.updatedBy || typeof p.updatedBy !== 'string') p.updatedBy = 'admin';
      // If updatedBy is an old orgId, map to a manager username if exists
      const maybeMgr = db.users.find(u => u.role === 'manager' && u.orgId === p.updatedBy);
      if (maybeMgr) p.updatedBy = maybeMgr.username;
    });

    db.schemaVersion = SCHEMA_VERSION;
    return db;
  }

  // For v3+ -> just update schema version
  db.schemaVersion = SCHEMA_VERSION;
  return db;
}

function ensureOrgPins(db) {
  if (!db || typeof db !== 'object') return db;
  if (!Array.isArray(db.orgs)) db.orgs = [];
  if (!Array.isArray(db.users)) db.users = [];

  db.orgs.forEach((org) => {
    if (!org) return;
    // ensure org.pin exists
    if (!org.pin) {
      const mgr = db.users.find(u => u.role === 'manager' && u.orgId === org.id);
      org.pin = (mgr?.password || DEFAULT_ORG_PIN).toString();
    }

    // ensure manager user exists and sync password with org.pin
    let mgr = db.users.find(u => u.role === 'manager' && u.orgId === org.id);
    if (!mgr) {
      db.users.push({
        id: `u-mgr-${org.id}`,
        username: `mgr-${org.id}`,
        password: org.pin.toString(),
        role: 'manager',
        orgId: org.id,
        active: true
      });
    } else {
      mgr.password = org.pin.toString();
      if (mgr.active === undefined) mgr.active = true;
    }
  });

  // ensure admin exists
  if (!db.users.some(u => u.role === 'admin')) {
    db.users.unshift({ id: 'u-admin', username: 'admin', password: '999999', role: 'admin', active: true });
  }

  return db;
}

function seedDemoProjectsB(db) {
  // เติมเดโมเพื่อให้กราฟชุด B เห็นชัด (เติมเฉพาะตอนข้อมูลเดโมยังน้อย)
  if (!db || typeof db !== 'object') return db;
  if (db.demoSeededB) return db;
  if (!Array.isArray(db.projects)) db.projects = [];

  // ถ้ามีข้อมูลเยอะแล้ว แปลว่าผู้ใช้เริ่มกรอกจริง ไม่เติมเพิ่ม
  // แต่ถ้ายังไม่มีโครงการเยอะพอ ให้เติมให้ครบ 37 โครงการ
  if (db.projects.length >= 37) return db;

  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const mk = (id, orgId, title, budget, startDate, endDate, sdg, updatedBy, createdDaysAgo, updatedDaysAgo) => ({
    id,
    orgId,
    title,
    budget,
    objective: 'ข้อมูลเดโมเพื่อแสดงกราฟ (สามารถแก้ไข/ลบได้)',
    startDate,
    endDate,
    policy: 'เดโม: เชื่อมโยงการขับเคลื่อน SDG 4 ในพื้นที่',
    owner: 'ผู้รับผิดชอบ (เดโม)',
    year: 2568,
    sdg: sdg || [],
    images: [],
    createdAt: now - day * (createdDaysAgo || 30),
    updatedAt: now - day * (updatedDaysAgo || 7),
    updatedBy: updatedBy || 'admin'
  });

  const seeds = [
    // ให้บางหน่วยงานมีโครงการเยอะ เพื่อให้กราฟ/สรุปเห็นความต่างชัด
    // สพป.นม.1 (org-002)
    mk('p-3',  'org-002', 'โครงการยกระดับผลสัมฤทธิ์ภาษาไทย ป.1–ป.3', 320000, '2025-03-01', '2025-09-30', ['4.1','4.6'], 'mgr-org-002', 28, 4),
    mk('p-4',  'org-002', 'โครงการเตรียมความพร้อมเด็กปฐมวัยคุณภาพ',        210000, '2025-01-10', '2025-05-31', ['4.2','4.a'], 'mgr-org-002', 34, 10),
    mk('p-5',  'org-002', 'โครงการพัฒนาทักษะอาชีพ/STEAM สำหรับเยาวชน',      450000, '2025-02-15', '2025-08-15', ['4.4','4.3'], 'mgr-org-002', 26, 3),
    mk('p-6',  'org-002', 'โครงการความเสมอภาคสำหรับผู้เรียนกลุ่มเปราะบาง',   150000, '2025-04-01', '2025-10-31', ['4.5','4.a'], 'mgr-org-002', 18, 2),

    // มรภ.นครราชสีมา (org-023)
    mk('p-7',  'org-023', 'โครงการอบรมครูแกนนำและพัฒนาวิทยฐานะ',            380000, '2025-01-20', '2025-04-30', ['4.c','4.7'], 'mgr-org-023', 40, 8),
    mk('p-8',  'org-023', 'โครงการระบบสถานศึกษาปลอดภัยและป้องกันความรุนแรง', 260000, '2025-05-01', '2025-09-30', ['4.a','4.5'], 'mgr-org-023', 20, 5),
    mk('p-9',  'org-023', 'โครงการทุนสนับสนุนการศึกษาต่อและฝึกอาชีพ',         120000, '2025-06-01', '2025-12-31', ['4.b','4.3'], 'mgr-org-023', 12, 1),

    // สอศ.โคราช (org-012)
    mk('p-10', 'org-012', 'โครงการพัฒนาหลักสูตรฐานสมรรถนะและทักษะชีวิต',      300000, '2025-02-01', '2025-06-30', ['4.7','4.1'], 'mgr-org-012', 32, 6),
    mk('p-11', 'org-012', 'โครงการอาชีวะทวิภาคีและการแนะแนวอาชีพ',           520000, '2025-03-15', '2025-11-15', ['4.3','4.4'], 'mgr-org-012', 24, 4),

    // ศึกษาธิการจังหวัด (org-035)
    mk('p-12', 'org-035', 'โครงการยกระดับการอ่านออกเขียนได้แบบเข้มข้น',       190000, '2025-01-05', '2025-07-31', ['4.6','4.1'], 'mgr-org-035', 38, 7),
    mk('p-13', 'org-035', 'โครงการห้องเรียนคุณภาพและสื่อการเรียนรู้',          410000, '2025-04-10', '2025-09-10', ['4.a','4.1','4.7'], 'mgr-org-035', 16, 3),

    // โครงการที่มี SDG เพียง 1 ตัว (ให้กราฟ "แท็ก 1 SDG" โผล่ชัด) - เพิ่มแค่ 3 โครงการ
    mk('p-15', 'org-002', 'โครงการพัฒนาการอ่านออกเขียนได้',                   160000, '2025-03-10', '2025-08-31', ['4.6'], 'mgr-org-002', 25, 5),
    mk('p-16', 'org-023', 'โครงการส่งเสริมสถานศึกษาปลอดภัย',                  220000, '2025-02-20', '2025-07-20', ['4.a'], 'mgr-org-023', 35, 9),
    mk('p-17', 'org-012', 'โครงการพัฒนาทักษะอาชีพ',                           280000, '2025-04-01', '2025-10-31', ['4.4'], 'mgr-org-012', 22, 4),

    // intentionally: no SDG (ให้กราฟ "ไม่ระบุ SDG" โผล่ชัด) - เพิ่มแค่ 1 โครงการ
    mk('p-14', 'org-012', 'โครงการเดโมที่ยังไม่ระบุ SDG',                      null,    '2025-07-01', '2025-09-30', [], 'mgr-org-012', 8, 1),

    // เพิ่มโครงการที่มี SDG หลายตัวเพื่อให้ครบ 37 โครงการ (เน้นสัดส่วนหลาย SDG)
    // สพป.นม.1 (org-002) - เพิ่มอีก 4 โครงการ
    mk('p-25', 'org-002', 'โครงการพัฒนาคุณภาพการศึกษาระดับประถมศึกษา',         290000, '2025-03-15', '2025-09-15', ['4.1','4.2','4.a'], 'mgr-org-002', 27, 6),
    mk('p-26', 'org-002', 'โครงการส่งเสริมการอ่านออกเขียนได้แบบบูรณาการ',     170000, '2025-04-05', '2025-10-05', ['4.1','4.6','4.7'], 'mgr-org-002', 23, 4),
    mk('p-27', 'org-002', 'โครงการพัฒนาทักษะอาชีพและทักษะชีวิต',               310000, '2025-02-20', '2025-08-20', ['4.4','4.7','4.c'], 'mgr-org-002', 29, 7),
    mk('p-28', 'org-002', 'โครงการลดความเหลื่อมล้ำและส่งเสริมความเสมอภาค',     200000, '2025-05-01', '2025-11-01', ['4.5','4.a','4.b'], 'mgr-org-002', 21, 3),

    // มรภ.นครราชสีมา (org-023) - เพิ่มอีก 4 โครงการ
    mk('p-30', 'org-023', 'โครงการพัฒนาการศึกษาระดับอุดมศึกษา',                420000, '2025-03-10', '2025-09-10', ['4.3','4.7','4.c'], 'mgr-org-023', 26, 5),
    mk('p-31', 'org-023', 'โครงการส่งเสริมสถานศึกษาปลอดภัยและคุณภาพ',          270000, '2025-04-15', '2025-10-15', ['4.a','4.1','4.5'], 'mgr-org-023', 24, 4),
    mk('p-32', 'org-023', 'โครงการพัฒนาทักษะอาชีพและนวัตกรรม',                 380000, '2025-02-28', '2025-08-28', ['4.4','4.3','4.7'], 'mgr-org-023', 28, 6),
    mk('p-33', 'org-023', 'โครงการส่งเสริมทุนการศึกษาและลดความเหลื่อมล้ำ',     190000, '2025-05-10', '2025-11-10', ['4.b','4.5','4.a'], 'mgr-org-023', 22, 3),

    // สอศ.โคราช (org-012) - เพิ่มอีก 4 โครงการ
    mk('p-35', 'org-012', 'โครงการพัฒนาอาชีวศึกษาและทักษะอาชีพ',              480000, '2025-03-20', '2025-09-20', ['4.3','4.4','4.7'], 'mgr-org-012', 25, 5),
    mk('p-36', 'org-012', 'โครงการส่งเสริมการอ่านออกเขียนได้และทักษะพื้นฐาน',  240000, '2025-04-25', '2025-10-25', ['4.6','4.1','4.7'], 'mgr-org-012', 23, 4),
    mk('p-37', 'org-012', 'โครงการพัฒนาคุณภาพสถานศึกษาและครู',                 360000, '2025-02-12', '2025-08-12', ['4.a','4.c','4.1'], 'mgr-org-012', 27, 6),
    mk('p-38', 'org-012', 'โครงการลดความเหลื่อมล้ำและส่งเสริมทุนการศึกษา',      210000, '2025-05-15', '2025-11-15', ['4.5','4.b','4.a'], 'mgr-org-012', 21, 3),

    // ศึกษาธิการจังหวัด (org-035) - เพิ่มอีก 4 โครงการ
    mk('p-40', 'org-035', 'โครงการพัฒนาคุณภาพการศึกษาในทุกระดับ',               370000, '2025-03-25', '2025-09-25', ['4.1','4.2','4.3'], 'mgr-org-035', 26, 5),
    mk('p-41', 'org-035', 'โครงการส่งเสริมการอ่านออกเขียนได้และทักษะพื้นฐาน',  250000, '2025-04-30', '2025-10-30', ['4.6','4.7','4.1'], 'mgr-org-035', 24, 4),
    mk('p-42', 'org-035', 'โครงการพัฒนาสถานศึกษาปลอดภัยและคุณภาพ',             300000, '2025-02-18', '2025-08-18', ['4.a','4.1','4.5'], 'mgr-org-035', 28, 6),
    mk('p-43', 'org-035', 'โครงการส่งเสริมทุนการศึกษาและลดความเหลื่อมล้ำ',       220000, '2025-05-20', '2025-11-20', ['4.b','4.5','4.a'], 'mgr-org-035', 22, 3),

    // หน่วยงานอื่นๆ - เพิ่มอีก 1 โครงการ
    mk('p-45', 'org-001', 'โครงการพัฒนาคุณภาพการศึกษา',                        280000, '2025-03-08', '2025-09-08', ['4.1','4.2','4.3'], 'mgr-org-001', 25, 5),
  ];

  const existingIds = new Set(db.projects.map(p => p.id));
  seeds.forEach(p => { if (!existingIds.has(p.id)) db.projects.push(p); });

  db.demoSeededB = true;
  try { saveData(); } catch {}
  return db;
}

function saveData() {
      localStorage.setItem(LS_KEY, JSON.stringify(DB));
    }

function loadSession() {
      const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
      try { return JSON.parse(raw); } catch { return null; }
    }

function migrateSession(s) {
  if (!s || typeof s !== 'object') return null;
  if (s.userId) return s;

  // Old session format: {role:'admin'} or {role:'manager', orgId}
  if (s.role === 'admin') {
    const adminUser = (DB.users || []).find(u => u.role === 'admin' && u.active !== false);
    return adminUser ? { role: 'admin', userId: adminUser.id } : null;
  }
  if (s.role === 'manager' && s.orgId) {
    const mgr = (DB.users || []).find(u => u.role === 'manager' && u.orgId === s.orgId && u.active !== false);
    return mgr ? { role: 'manager', userId: mgr.id, orgId: mgr.orgId } : null;
  }
  return null;
}

function saveSession(s) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }

function clearSession() {
      localStorage.removeItem(SESSION_KEY);
    }

// ==================== Utilities ====================
function randomId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function formatMoney(n) {
  return Number(n || 0).toLocaleString('th-TH');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getOrgName(orgId) {
  if (orgId === 'admin') return 'Admin';
  const org = DB.orgs.find(o => o.id === orgId);
  return org ? org.name : '-';
}

function getDisplayNameFromUsername(username) {
  if (!username) return '-';
  if (username === 'admin') return 'Admin';
  
  // If username is in format 'mgr-org-xxx', find the user and get org name
  if (username.startsWith('mgr-')) {
    const user = DB.users.find(u => u.username === username && u.orgId);
    if (user && user.orgId) {
      return getOrgName(user.orgId);
    }
  }
  
  // Fallback: return username as-is if not found
  return username;
}

function getCurrentUser() {
  if (!session?.userId) return null;
  return (DB.users || []).find(u => u.id === session.userId) || null;
}

function getCurrentUsername() {
  const u = getCurrentUser();
  return u?.username || (session?.role === 'admin' ? 'admin' : 'unknown');
}

function canEdit(project) {
  if (!session) return false;
  if (session.role === 'admin') return true;
  if (session.role === 'manager') return project.orgId === session.orgId;
  return false;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Custom Year Picker - Show only years (BE format)
function openYearPicker(inputId, callback) {
  // Close any existing picker
  closeYearPicker();
  
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const hiddenInput = document.getElementById(inputId + 'Value');
  const currentYear = hiddenInput ? Number(hiddenInput.value) : null;
  
  // Create year picker dropdown
  const picker = document.createElement('div');
  picker.className = 'year-picker-dropdown';
  picker.id = 'yearPickerDropdown';
  
  // Year range: BE (no limit)
  const startYear = 2500; // Minimum reasonable year
  const endYear = 3000;   // Maximum reasonable year
  let currentViewYear = currentYear || new Date().getFullYear() + 543;
  if (currentViewYear < startYear) currentViewYear = startYear;
  if (currentViewYear > endYear) currentViewYear = endYear;
  
  function renderYearPicker(year) {
    const years = [];
    // Show 9 years: 4 before, current, 4 after (3x3 grid)
    // No limit - can navigate to any year
    const start = year - 4;
    const end = year + 4;
    
    for (let y = start; y <= end; y++) {
      years.push(y);
    }
    
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
    
    // Insert after input
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(picker);
  }
  
  // Store current view year in picker element
  picker.dataset.viewYear = currentViewYear;
  
  // Make functions available globally
  window.navigateYearPicker = function(newYear) {
    // No limit on year navigation
    picker.dataset.viewYear = newYear;
    renderYearPicker(newYear);
  };
  
  window.selectYear = function(year, id, hasCallback) {
    const yearInput = document.getElementById(id);
    const yearValueInput = document.getElementById(id + 'Value');
    
    if (yearInput) {
      yearInput.value = year;
    }
    if (yearValueInput) {
      yearValueInput.value = year;
    }
    
    closeYearPicker();
    
    if (hasCallback && callback) {
      callback();
    }
  };
  
  renderYearPicker(currentViewYear);
  
  // Prevent clicks inside picker from closing it
  picker.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Close on outside click
  setTimeout(() => {
    const closeHandler = function(e) {
      if (!picker.contains(e.target) && e.target !== input && !input.contains(e.target)) {
        closeYearPicker();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  }, 100);
}

function closeYearPicker() {
  const picker = document.getElementById('yearPickerDropdown');
  if (picker) {
    picker.remove();
  }
  delete window.navigateYearPicker;
  delete window.selectYear;
}

// ==================== SweetAlert Helpers ====================
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

function showSuccess(title, text = '') {
  Toast.fire({ icon: 'success', title, text });
}

function showError(title, text = '') {
  Toast.fire({ icon: 'error', title, text });
}

function showInfo(title, text = '') {
  Toast.fire({ icon: 'info', title, text });
}

function showWarning(title, text = '') {
  Toast.fire({ icon: 'warning', title, text });
}

// Convert hex color to light background and dark text for softer badge appearance
function getSoftBadgeColors(hexColor) {
  if (!hexColor || hexColor === '#ccc') {
    return { bg: 'var(--badge-neutral-bg)', text: 'var(--badge-neutral-text)' };
  }
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Create light background (mix with white ~85%)
  const bgR = Math.round(r * 0.15 + 255 * 0.85);
  const bgG = Math.round(g * 0.15 + 255 * 0.85);
  const bgB = Math.round(b * 0.15 + 255 * 0.85);
  const bgColor = `rgb(${bgR}, ${bgG}, ${bgB})`;
  
  // Create dark text (darken original color ~40%)
  const textR = Math.round(r * 0.6);
  const textG = Math.round(g * 0.6);
  const textB = Math.round(b * 0.6);
  const textColor = `rgb(${textR}, ${textG}, ${textB})`;
  
  return { bg: bgColor, text: textColor };
}

async function confirm(title, text, confirmText = 'ยืนยัน') {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#2563eb', // Use theme blue-600
    cancelButtonColor: '#d33',
  });
  return result.isConfirmed;
}

// ==================== Login ====================
function initLogin() {
  const select = document.getElementById('loginOrg');
  if (!select) return;
  select.innerHTML = '<option value="admin">Admin</option>';

  (DB.orgs || []).filter(o => o.active).forEach(org => {
    const opt = document.createElement('option');
    opt.value = org.id;
    opt.textContent = org.name;
    select.appendChild(opt);
  });
}

document.getElementById('loginBtn')?.addEventListener('click', () => {
  const orgId = document.getElementById('loginOrg')?.value;
  const pin = document.getElementById('loginPin')?.value.trim();

  if (!/^\d{6}$/.test(pin || '')) {
    showWarning('PIN ไม่ถูกต้อง', 'กรุณาระบุรหัส PIN 6 หลัก');
    return;
  }

  ensureOrgPins(DB);

  if (orgId === 'admin') {
    const adminUser = (DB.users || []).find(u => u.role === 'admin' && u.active !== false) || null;
    if (!adminUser || pin !== adminUser.password) {
      showError('เข้าสู่ระบบไม่สำเร็จ', 'รหัส PIN ของผู้ดูแลระบบไม่ถูกต้อง');
      return;
    }
    session = { role: 'admin', userId: adminUser.id };
    saveSession(session);
    showSuccess('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับเข้าสู่ระบบ');
    initApp();
    return;
  }

  const org = (DB.orgs || []).find(o => o.id === orgId && o.active);
  if (!org) {
    showError('เข้าสู่ระบบไม่สำเร็จ', 'หน่วยงานถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
    return;
  }

  const mgr = (DB.users || []).find(u => u.role === 'manager' && u.orgId === orgId && u.active !== false) || null;
  if (!mgr || pin !== String(org.pin || mgr.password || '')) {
    showError('เข้าสู่ระบบไม่สำเร็จ', 'PIN ไม่ถูกต้อง');
    return;
  }

  session = { role: 'manager', userId: mgr.id, orgId: orgId };
  saveSession(session);
  showSuccess('เข้าสู่ระบบสำเร็จ', `หน่วยงาน: ${org.name}`);
  initApp();
});

document.getElementById('loginPin')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('loginBtn').click();
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  const ok = await confirm('ออกจากระบบ', 'ต้องการออกจากระบบใช่ไหม?', 'ออกจากระบบ');
  if (ok) {
    clearSession();
    session = null;
    showInfo('ออกจากระบบแล้ว', 'ออกจากระบบสำเร็จ');
    location.reload();
  }
});

// ==================== Navigation ====================
let currentPage = 'dashboard';
let projectsScope = 'manage'; // 'all' | 'manage'

function initApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');

  // Ensure sticky offsets align to actual navbar height
  syncNavHeight();
  window.addEventListener('resize', syncNavHeight);
  
  document.getElementById('userDisplay').textContent =
    session.role === 'admin'
      ? `Admin`
      : `${getOrgName(session.orgId)}`;
  
  renderMenu();
  // Show dashboard for both roles (manager is read-only)
  navigateTo('dashboard');
}

function renderMenu() {
  const menu = document.getElementById('mainMenu');
  const items = [];
  
  if (session.role === 'admin') {
    items.push(
      { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
      { id: 'organizations', icon: 'fa-building', label: 'จัดการหน่วยงาน' },
      { id: 'users', icon: 'fa-key', label: 'ตั้งค่า PIN หน่วยงาน' },
      { id: 'projects', icon: 'fa-tasks', label: 'จัดการโครงการ' },
      { id: 'audit-log', icon: 'fa-list-alt', label: 'Audit Log' }
    );
  } else {
    items.push(
      { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
      { id: 'projects-all', icon: 'fa-globe', label: 'โครงการทั้งหมด' },
      { id: 'projects', icon: 'fa-tasks', label: 'จัดการโครงการ' },
      { id: 'organizations-view', icon: 'fa-building', label: 'หน่วยงานทั้งหมด' }
    );
  }
  
  menu.innerHTML = items.map(item => `
    <li class="${currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
      <a>
        <i class="fas ${item.icon}"></i>
        ${item.label}
      </a>
    </li>
  `).join('');
  
  menu.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const page = li.getAttribute('data-page');
      navigateTo(page);
      // Close sidebar on mobile after navigation
      const sidebarToggle = document.getElementById('sidebar-toggle');
      if (sidebarToggle && window.innerWidth < 1024) {
        sidebarToggle.checked = false;
      }
    });
  });
}

function navigateTo(page) {
  currentPage = page;
  renderMenu();
  
  const content = document.getElementById('pageContent');
  
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
      // Backward-compat: keep route, redirect to manage page
      renderProjects();
      break;
    case 'audit-log':
      renderAuditLog();
      break;
    default:
      content.innerHTML = '<h1>Page not found</h1>';
  }
}

// ==================== Dashboard Page ====================
function renderDashboard() {
  const content = document.getElementById('pageContent');
  
  const totalProjects = DB.projects.length;
  const totalBudget = DB.projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalOrgs = DB.orgs.filter(o => o.active).length;
  
  content.innerHTML = `
    <div class="page">
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
        <div class="stat-card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">โครงการทั้งหมด</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">${totalProjects}</p>
              <p class="text-sm text-gray-500 mt-1">รายการ</p>
            </div>
            <div class="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i class="fas fa-project-diagram"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">งบประมาณรวม</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">${formatMoney(totalBudget)}</p>
              <p class="text-sm text-gray-500 mt-1">บาท</p>
            </div>
            <div class="w-16 h-16 rounded-xl bg-green-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i class="fas fa-dollar-sign"></i>
            </div>
          </div>
        </div>
        
        <div class="stat-card card-hover">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-500 text-sm font-medium">หน่วยงาน</p>
              <p class="text-3xl font-bold text-gray-800 mt-2">${totalOrgs}</p>
              <p class="text-sm text-gray-500 mt-1">หน่วยงานที่ใช้งาน</p>
            </div>
            <div class="w-16 h-16 rounded-xl bg-orange-600 flex items-center justify-center text-white text-2xl shadow-lg">
              <i class="fas fa-building"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="stat-card card-hover">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            เป้าหมาย SDG ที่ถูกใช้มากที่สุด 5 อันดับแรก
          </h3>
          <div class="chart-container">
            <canvas id="chartSdgTop"></canvas>
          </div>
          <div class="text-center mt-4">
            <p class="text-xl font-bold text-gray-800" id="kpiSdgTop">-</p>
            <p class="text-sm text-gray-500">เป้าหมายย่อยที่มีการใช้งานมากที่สุด</p>
          </div>
        </div>
        
        <div class="stat-card card-hover">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            การจัดกลุ่มโครงการตามจำนวนเป้าหมาย SDG
          </h3>
          <div class="chart-container">
            <canvas id="chartSdgMulti"></canvas>
          </div>
          <div class="text-center mt-4">
            <p class="text-xl font-bold text-gray-800" id="kpiMultiPct">-</p>
            <p class="text-sm text-gray-500">สัดส่วนโครงการที่มีหลายเป้าหมาย SDG</p>
          </div>
        </div>
        
        <div class="stat-card card-hover">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">
            การกระจายตามหมวดหมู่ SDG 4
          </h3>
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
  
  // Render data
  renderDashboardData();
  scheduleDashboardCharts();
}

// Chart.js can render blank if charts are initialized while the app is still hidden.
// Schedule chart creation after layout is stable (post-login / post-navigation).
function scheduleDashboardCharts() {
  const tryRender = (attempt = 0) => {
    const chartReady = typeof window.Chart === 'function';
    const canvasReady = !!document.getElementById('chartSdgTop');
    const pageVisible = !document.getElementById('mainApp')?.classList.contains('hidden');
    if (!chartReady || !canvasReady || !pageVisible) {
      if (attempt < 30) return setTimeout(() => tryRender(attempt + 1), 100);
      return;
    }

    renderDashboardCharts();

    // Force resize after first paint so the doughnut charts calculate correct dimensions.
    requestAnimationFrame(() => {
      try {
        Object.values(charts || {}).forEach(c => {
          if (c && typeof c.resize === 'function') c.resize();
        });
      } catch {}
    });
  };

  // Two ticks to ensure the DOM has been painted and sized.
  requestAnimationFrame(() => setTimeout(() => tryRender(0), 0));
}

function renderDashboardData() {
  // By Organization
  const byOrg = {};
  DB.projects.forEach(p => {
    if (!byOrg[p.orgId]) {
      byOrg[p.orgId] = { count: 0, budget: 0 };
    }
    byOrg[p.orgId].count++;
    byOrg[p.orgId].budget += p.budget || 0;
  });
  
  const tableByOrg = document.getElementById('tableByOrg');
  tableByOrg.innerHTML = Object.entries(byOrg)
    .sort((a, b) => b[1].budget - a[1].budget)
    .map(([orgId, data]) => `
      <tr>
        <td class="font-medium">${getOrgName(orgId)}</td>
        <td class="text-right">${data.count}</td>
        <td class="text-right">${formatMoney(data.budget)} ฿</td>
      </tr>
    `).join('');
  
  // By SDG
  const bySdg = {};
  const projectsBySdg = {}; // Track unique projects per SDG
  DB.projects.forEach(p => {
    (p.sdg || []).forEach(sdg => {
      if (!bySdg[sdg]) {
        bySdg[sdg] = { count: 0 };
        projectsBySdg[sdg] = new Set();
      }
      projectsBySdg[sdg].add(p.id); // Unique project IDs
    });
  });
  // Set count to unique project count
  Object.keys(bySdg).forEach(sdg => {
    bySdg[sdg].count = projectsBySdg[sdg].size;
  });
  
  const tableBySdg = document.getElementById('tableBySdg');
  tableBySdg.innerHTML = SDG_TARGETS
    .filter(t => bySdg[t.id])
    .map(t => `
      <tr>
        <td>
          <span class="badge badge-sm" style="background: ${getSoftBadgeColors(t.color).bg}; color: ${getSoftBadgeColors(t.color).text};">
            ${t.id}
          </span>
          </td>
        <td class="text-right">${bySdg[t.id].count}</td>
      </tr>
    `).join('');
}

function renderDashboardCharts() {
  const projects = DB.projects || [];

  // 1) Top SDG targets (count tag occurrences), Top 5 + Other
  const sdgCount = {};
  projects.forEach(p => {
    (p.sdg || []).forEach(code => {
      sdgCount[code] = (sdgCount[code] || 0) + 1;
    });
  });
  const sdgSorted = Object.entries(sdgCount).sort((a, b) => b[1] - a[1]);
  const topN = 5;
  const top = sdgSorted.slice(0, topN);
  const sdgLabels = top.map(([code]) => {
    const meta = SDG_TARGETS.find(t => t.id === code);
    return meta ? `${code} - ${meta.label}` : code;
  });
  const sdgValues = top.map(([, v]) => v);
  createDoughnutChart('chartSdgTop', { labels: sdgLabels, values: sdgValues }, ['#2563eb','#3b82f6','#6366f1','#8b5cf6','#a855f7','#94a3b8']);
  const top1 = sdgSorted[0];
  const top1Label = top1
    ? (() => {
        const meta = SDG_TARGETS.find(t => t.id === top1[0]);
        return meta ? `${top1[0]}` : `${top1[0]}`;
      })()
    : '-';
  const top1Count = top1 ? top1[1] : 0;
  const kpiSdgTop = document.getElementById('kpiSdgTop');
  if (kpiSdgTop) kpiSdgTop.textContent = top1 ? `${top1Label} (${top1Count})` : '-';

  // 2) Projects with single vs multiple SDG tags (and none)
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
  const kpiMultiPct = document.getElementById('kpiMultiPct');
  if (kpiMultiPct) {
    const denom = Math.max(1, single + multi + none);
    const pct = Math.round((multi / denom) * 100);
    kpiMultiPct.textContent = `${pct}%`;
  }

  // 3) Group SDG targets into categories (count tag occurrences)
  const groups = [
    { id: 'access', label: 'คุณภาพการศึกษาในทุกระดับ', codes: new Set(['4.1','4.2','4.3']) },
    { id: 'skills', label: 'ทักษะ/อาชีพ', codes: new Set(['4.4']) },
    { id: 'equity', label: 'ความเสมอภาค/กลุ่มเปราะบาง', codes: new Set(['4.5']) },
    { id: 'literacy', label: 'ทักษะพื้นฐาน/พลเมืองโลก', codes: new Set(['4.6','4.7']) },
    { id: 'enablers', label: 'ระบบสนับสนุน (สถานศึกษา/ครู)', codes: new Set(['4.a','4.c']) },
    { id: 'scholarships', label: 'ทุนการศึกษา', codes: new Set(['4.b']) },
  ];
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
  const groupPairs = groups.map(g => [g, groupCount[g.id]]).filter(([, v]) => v > 0);
  if (unclassified > 0) groupPairs.push([{ id: 'other', label: 'อื่นๆ' }, unclassified]);
  const groupLabels = groupPairs.map(([g]) => g.label);
  const groupValues = groupPairs.map(([, v]) => v);
  createDoughnutChart('chartSdgGroups', { labels: groupLabels, values: groupValues }, ['#2563eb','#16a34a','#f59e0b','#3b82f6','#eab308','#ef4444','#94a3b8']);
  const topGroup = groupPairs.sort((a,b) => b[1]-a[1])[0];
  const kpiTopGroup = document.getElementById('kpiTopGroup');
  if (kpiTopGroup) kpiTopGroup.textContent = topGroup ? `${topGroup[0].label} (${topGroup[1]})` : '-';
}

function createDoughnutChart(canvasId, data, colors) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  
  if (charts[canvasId]) {
    charts[canvasId].destroy();
  }
  
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
        legend: {
          display: false
        },
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
      cutout: '70%'
    }
  });
}

function exportCSV() {
  // Export should include all projects (everyone can view all projects).
  const projects = (DB.projects || []);

  const sanitizeCell = (v) =>
    String(v ?? '')
      .replace(/\r?\n/g, ' ')
      .replace(/\t/g, ' ')
      .trim();

  const durationOf = (p) => [p.startDate, p.endDate].filter(Boolean).join(' - ');
  const imageInfoOf = (_p) => '';

  // Columns:
  // - defaultSelected: the "yellow" fields from the user's template
  const COLUMNS = [
    { id: 'org', label: 'หน่วยงานหลัก', defaultSelected: true, get: (p) => getOrgName(p.orgId) },
    { id: 'title', label: 'ชื่อโครงการ', defaultSelected: true, get: (p) => p.title ?? '' },
    { id: 'budget', label: 'งบประมาณ (บาท)', defaultSelected: true, get: (p) => p.budget ?? '' },
    { id: 'objective', label: 'วัตถุประสงค์ของโครงการ', defaultSelected: true, get: (p) => p.objective ?? '' },
    { id: 'duration', label: 'ระยะเวลาในการดำเนินงาน', defaultSelected: true, get: (p) => durationOf(p) },
    { id: 'policy', label: 'ข้อเสนอแนะเชิงนโยบาย', defaultSelected: true, get: (p) => p.policy ?? '' },
    { id: 'owner', label: 'ผู้รับผิดชอบ', defaultSelected: true, get: (p) => p.owner ?? '' },
    { id: 'sdg', label: 'SDG targets', defaultSelected: true, get: (p) => (p.sdg || []).join(', ') },
    { id: 'images', label: 'url (ภาพกิจกรรม 3-4 ภาพ)', defaultSelected: true, get: (p) => imageInfoOf(p) },

    // Optional extras
    { id: 'id', label: 'ID', defaultSelected: false, get: (p) => p.id ?? '' },
    { id: 'year', label: 'ปีงบประมาณ', defaultSelected: false, get: (p) => p.year ?? '' },
    { id: 'imageCount', label: 'จำนวนรูป', defaultSelected: false, get: (_p) => '' },
    { id: 'startDate', label: 'วันเริ่ม', defaultSelected: false, get: (p) => p.startDate ?? '' },
    { id: 'endDate', label: 'วันสิ้นสุด', defaultSelected: false, get: (p) => p.endDate ?? '' },
  ];

  const buildExports = (selectedColIds, selectedProjectIds) => {
    const selectedCols = COLUMNS.filter(c => selectedColIds.includes(c.id));
    const header = selectedCols.map(c => c.label);
    const chosenProjects = (selectedProjectIds?.length ? projects.filter(p => selectedProjectIds.includes(p.id)) : projects);
    const rows = chosenProjects.map(p => selectedCols.map(c => c.get(p)));
    const tsv = [header, ...rows].map(row => row.map(sanitizeCell).join('\t')).join('\n');
    const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(',')).join('\n');
    return { header, rows, tsv, csv, selectedColIds, selectedProjectIds, rowCount: chosenProjects.length };
  };

  const defaultSelectedColIds = COLUMNS.filter(c => c.defaultSelected).map(c => c.id);
  const defaultSelectedProjectIds = projects.map(p => p.id); // default = export all projects
  lastExport = buildExports(defaultSelectedColIds, defaultSelectedProjectIds);

  const countLabel =
    `รวม ${projects.length} โครงการ (ทุกหน่วยงาน)`;

  Swal.fire({
    title: 'ส่งออกข้อมูลโครงการ',
    html: `
      <div class="text-left space-y-3">
        <div class="text-sm text-gray-600">${countLabel} กรุณาเลือกโครงการและคอลัมน์ที่ต้องการส่งออก</div>

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="font-semibold text-gray-700">เลือกโครงการ</div>
            <div class="flex gap-2">
              <button id="btnExportAllRows" class="btn btn-xs btn-outline">เลือกทั้งหมด</button>
              <button id="btnExportNoRows" class="btn btn-xs btn-outline">ไม่เลือกเลย</button>
            </div>
          </div>
          <div class="mt-2">
            <input id="exportProjectSearch" class="input input-bordered input-sm w-full" placeholder="ค้นหาโครงการ" />
          </div>
          <div id="exportProjects" class="mt-3 max-h-44 overflow-auto border border-gray-200 rounded-lg bg-white p-2"></div>
          <div class="text-xs text-gray-500 mt-2">
            ค่าเริ่มต้น: ส่งออกทุกโครงการ
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="font-semibold text-gray-700">เลือกคอลัมน์</div>
            <div class="flex gap-2">
              <button id="btnExportAllCols" class="btn btn-xs btn-outline">เลือกทั้งหมด</button>
              <button id="btnExportNoCols" class="btn btn-xs btn-outline">ไม่เลือกเลย</button>
              <button id="btnExportResetCols" class="btn btn-xs btn-outline">รีเซ็ตค่าเริ่มต้น</button>
            </div>
          </div>
          <div id="exportCols" class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3"></div>
          <div class="text-xs text-gray-500 mt-2">
            ค่าเริ่มต้น: คอลัมน์ตามแบบฟอร์มมาตรฐาน
          </div>
        </div>

        <div class="flex flex-wrap gap-2 justify-end">
          <button id="btnDownloadCsv" class="btn btn-primary">
            <i class="fas fa-file-alt mr-2"></i>ดาวน์โหลดไฟล์ CSV
          </button>
        </div>
        <div class="text-xs text-gray-500">
          หมายเหตุ: ข้อมูลรูปภาพจะแสดงเป็นจำนวนรูปที่แนบในระบบ ไม่ส่งออกไฟล์รูปภาพ
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: () => {
      const colsWrap = document.getElementById('exportCols');
      if (colsWrap) {
        colsWrap.innerHTML = COLUMNS.map(c => `
          <label class="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" class="checkbox checkbox-sm mt-0.5" data-col="${c.id}" ${c.defaultSelected ? 'checked' : ''}/>
            <span class="text-sm">${c.label}</span>
          </label>
        `).join('');
      }

      const projWrap = document.getElementById('exportProjects');
      const renderProjectList = (q = '') => {
        if (!projWrap) return;
        const query = (q || '').trim().toLowerCase();
        const filtered = projects.filter(p => {
          const title = String(p.title || '').toLowerCase();
          const org = String(getOrgName(p.orgId) || '').toLowerCase();
          return !query || title.includes(query) || org.includes(query);
        });
        if (filtered.length === 0) {
          projWrap.innerHTML = `<div class="text-sm text-gray-500 p-2">ไม่พบโครงการ</div>`;
          return;
        }
        projWrap.innerHTML = filtered.map(p => {
          const orgName = getOrgName(p.orgId);
          const sub = `<div class="text-xs text-gray-500">${orgName}</div>`;
          return `
            <label class="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
              <input type="checkbox" class="checkbox checkbox-sm mt-0.5" data-pid="${p.id}" checked />
              <span class="text-sm">
                <div class="font-medium">${p.title || '-'}</div>
                ${sub}
              </span>
            </label>
          `;
        }).join('');
      };
      renderProjectList('');

      const getSelectedIds = () =>
        Array.from(document.querySelectorAll('#exportCols input[type="checkbox"][data-col]'))
          .filter(el => el.checked)
          .map(el => el.getAttribute('data-col'));

      const getSelectedProjectIds = () =>
        Array.from(document.querySelectorAll('#exportProjects input[type="checkbox"][data-pid]'))
          .filter(el => el.checked)
          .map(el => el.getAttribute('data-pid'));

      const updatePreview = () => {
        const selectedColIds = getSelectedIds();
        const selectedProjectIds = getSelectedProjectIds();
        if (selectedColIds.length === 0) {
          lastExport = { tsv: '', csv: '', selectedColIds, selectedProjectIds };
          return;
        }
        if (selectedProjectIds.length === 0) {
          lastExport = { tsv: '', csv: '', selectedColIds, selectedProjectIds };
          return;
        }
        lastExport = buildExports(selectedColIds, selectedProjectIds);
      };

      // Live update when toggling columns
      document.getElementById('exportCols')?.addEventListener('change', updatePreview);
      document.getElementById('exportProjects')?.addEventListener('change', updatePreview);
      document.getElementById('exportProjectSearch')?.addEventListener('input', (e) => {
        renderProjectList(e.target.value);
        // After re-render, keep preview in sync
        updatePreview();
      });

      const setAll = (checked) => {
        document.querySelectorAll('#exportCols input[type="checkbox"][data-col]').forEach(el => {
          el.checked = checked;
        });
        updatePreview();
      };

      document.getElementById('btnExportAllCols')?.addEventListener('click', () => setAll(true));
      document.getElementById('btnExportNoCols')?.addEventListener('click', () => setAll(false));
      document.getElementById('btnExportResetCols')?.addEventListener('click', () => {
        document.querySelectorAll('#exportCols input[type="checkbox"][data-col]').forEach(el => {
          const id = el.getAttribute('data-col');
          const col = COLUMNS.find(c => c.id === id);
          el.checked = !!col?.defaultSelected;
        });
        updatePreview();
      });

      const setAllRows = (checked) => {
        document.querySelectorAll('#exportProjects input[type="checkbox"][data-pid]').forEach(el => {
          el.checked = checked;
        });
        updatePreview();
      };
      document.getElementById('btnExportAllRows')?.addEventListener('click', () => setAllRows(true));
      document.getElementById('btnExportNoRows')?.addEventListener('click', () => setAllRows(false));

      document.getElementById('btnDownloadCsv')?.addEventListener('click', () => {
        if (!(lastExport?.rows || []).length || !(lastExport?.header || []).length) {
          showWarning('ไม่สามารถดาวน์โหลดได้', 'กรุณาเลือกอย่างน้อย 1 โครงการ และ 1 คอลัมน์');
          return;
        }
        try {
          const csvContent = lastExport.csv || '';
          if (!csvContent) {
            showError('ไม่สามารถส่งออกข้อมูลได้', 'ไม่มีข้อมูลที่จะส่งออก');
            return;
          }

          // Add BOM for UTF-8 to support Thai characters in Excel
          const BOM = '\uFEFF';
          const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `sdg4_projects_${new Date().getTime()}.csv`;
          link.click();
          URL.revokeObjectURL(link.href);
          showSuccess('ดาวน์โหลดสำเร็จ', 'ไฟล์ CSV ถูกดาวน์โหลดแล้ว');
        } catch (e) {
          showError('ไม่สามารถส่งออกข้อมูลได้', String(e?.message || e));
        }
      });
    }
  });
}

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
    confirmButtonColor: '#2563eb', // Use theme blue-600
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
    if (org) {
      org.name = formValues.name;
        saveData();
      showSuccess('อัปเดตสำเร็จ', 'ข้อมูลหน่วยงานถูกอัปเดตแล้ว');
    } else {
      const newOrg = {
        id: randomId('org'),
        name: formValues.name,
        active: true
      };
      DB.orgs.push(newOrg);
      saveData();
      initLogin();
      showSuccess('เพิ่มสำเร็จ', 'หน่วยงานใหม่ถูกเพิ่มแล้ว');
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
    org.active = !org.active;
    saveData();
    initLogin();
    showSuccess(`${action}สำเร็จ`, `หน่วยงาน ${org.name} ถูก${action}แล้ว`);
    renderOrganizations();
  }
}

async function deleteOrg(orgId) {
  if (session?.role !== 'admin') return;
  const org = DB.orgs.find(o => o.id === orgId);
  if (!org) return;

  const projectCount = DB.projects.filter(p => p.orgId === orgId).length;
  const userCount = (DB.users || []).filter(u => u.role === 'manager' && u.orgId === orgId).length;

  const result = await Swal.fire({
    title: 'ลบหน่วยงาน',
    html: `
      <div class="text-left space-y-2">
        <p>ต้องการลบหน่วยงาน: <strong>${org.name}</strong> ใช่หรือไม่?</p>
        <p class="text-sm text-gray-600">โครงการที่เกี่ยวข้อง: <strong>${projectCount}</strong> โครงการ</p>
        <p class="text-sm text-gray-600">บัญชี Manager ที่เกี่ยวข้อง: <strong>${userCount}</strong> บัญชี</p>
        <p class="text-sm text-red-600 mt-2">คำเตือน: การลบไม่สามารถย้อนกลับได้</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    showDenyButton: projectCount > 0 || userCount > 0,
    confirmButtonText: 'ลบเฉพาะหน่วยงาน (ต้องไม่มีข้อมูลที่เกี่ยวข้อง)',
    denyButtonText: 'ลบพร้อมโครงการ/ผู้ใช้ที่เกี่ยวข้อง',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#d33',
    denyButtonColor: '#b91c1c'
  });

  if (result.isConfirmed) {
    if (projectCount > 0 || userCount > 0) {
      showError('ไม่สามารถลบได้', 'หน่วยงานนี้ยังมีโครงการ/ผู้ใช้ที่เกี่ยวข้อง เลือก "ลบพร้อมโครงการ/ผู้ใช้ที่เกี่ยวข้อง" หรือไปลบ/ย้ายข้อมูลก่อน');
      return;
    }
    DB.orgs = DB.orgs.filter(o => o.id !== orgId);
    DB.audit = DB.audit || [];
    DB.audit.unshift({ at: Date.now(), action: 'delete_org', by: getCurrentUsername(), orgId });
    saveData();
    showSuccess('ลบสำเร็จ', 'หน่วยงานถูกลบแล้ว');
    renderOrganizations();
    return;
  }

  if (result.isDenied) {
    // cascade delete projects & manager users bound to the org
    DB.projects = DB.projects.filter(p => p.orgId !== orgId);
    DB.users = (DB.users || []).filter(u => !(u.role === 'manager' && u.orgId === orgId));
    DB.orgs = DB.orgs.filter(o => o.id !== orgId);
    DB.audit = DB.audit || [];
    DB.audit.unshift({ at: Date.now(), action: 'delete_org_cascade', by: getCurrentUsername(), orgId, projectCount, userCount });
    saveData();
    showSuccess('ลบสำเร็จ', 'ลบหน่วยงานพร้อมข้อมูลที่เกี่ยวข้องแล้ว');
    renderOrganizations();
  }
}

// ==================== Projects Page ====================
function renderProjects() {
  const content = document.getElementById('pageContent');
  projectsScope = 'manage';

  // Manager manage page: show only own projects. Admin: all.
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
      
      <!-- Filter -->
      <div class="stat-card mb-6 filter-sticky">
        <!-- Mobile: Collapsible filter -->
        <details class="lg:hidden">
          <summary class="cursor-pointer btn btn-outline btn-sm w-full justify-between mb-4">
            <span><i class="fas fa-filter mr-2"></i>ตัวกรอง</span>
            <i class="fas fa-chevron-down transition-transform"></i>
          </summary>
          <div class="mt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
              <div class="sm:col-span-2 md:col-span-3">
                <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
                <input type="text" id="searchProject" class="input input-bordered w-full" 
                       placeholder="ค้นหาชื่อโครงการ" oninput="filterProjects(event)">
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
                  ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => 
                    `<option value="${year}">${year}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
                <input type="number" id="filterBudgetMin" class="input input-bordered w-full" 
                       placeholder="เช่น 10000" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
                <input type="number" id="filterBudgetMax" class="input input-bordered w-full" 
                       placeholder="เช่น 1000000" onchange="filterProjects(event)">
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
        
        <!-- Desktop: Always visible filter -->
        <div class="hidden lg:block">
          <div class="flex flex-wrap items-end gap-2">
            <div class="shrink min-w-[180px] flex-1 max-w-[200px]">
              <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
              <input type="text" id="searchProject" class="input input-bordered w-full text-sm" 
                     placeholder="ค้นหาโครงการ" oninput="filterProjects(event)">
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
                ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => 
                  `<option value="${year}">${year}</option>`
                ).join('')}
              </select>
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
              <input type="number" id="filterBudgetMin" class="input input-bordered w-full text-sm" 
                     placeholder="เช่น 10000" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
              <input type="number" id="filterBudgetMax" class="input input-bordered w-full text-sm" 
                     placeholder="เช่น 1000000" onchange="filterProjects(event)">
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
      
      <!-- Projects Grid -->
      <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderProjectCards(visibleProjects)}
      </div>
    </div>
  `;
  
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

      <!-- Filter -->
      <div class="stat-card mb-6 filter-sticky">
        <!-- Mobile: Collapsible filter -->
        <details class="lg:hidden">
          <summary class="cursor-pointer btn btn-outline btn-sm w-full justify-between mb-4">
            <span><i class="fas fa-filter mr-2"></i>ตัวกรอง</span>
            <i class="fas fa-chevron-down transition-transform"></i>
          </summary>
          <div class="mt-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
              <div class="sm:col-span-2 md:col-span-3">
                <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
                <input type="text" id="searchProject" class="input input-bordered w-full" 
                       placeholder="ค้นหาชื่อโครงการ" oninput="filterProjects(event)">
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
                  ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => 
                    `<option value="${year}">${year}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
                <input type="number" id="filterBudgetMin" class="input input-bordered w-full" 
                       placeholder="เช่น 10000" onchange="filterProjects(event)">
              </div>
              <div class="sm:col-span-1 md:col-span-1">
                <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
                <input type="number" id="filterBudgetMax" class="input input-bordered w-full" 
                       placeholder="เช่น 1000000" onchange="filterProjects(event)">
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
        
        <!-- Desktop: Always visible filter -->
        <div class="hidden lg:block">
          <div class="flex flex-wrap items-end gap-2">
            <div class="shrink min-w-[180px] flex-1 max-w-[200px]">
              <label class="block text-sm font-medium mb-1">ค้นหาโครงการ</label>
              <input type="text" id="searchProject" class="input input-bordered w-full text-sm" 
                     placeholder="ค้นหาโครงการ" oninput="filterProjects(event)">
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
                ${[...new Set((DB.projects || []).map(p => p.year).filter(Boolean))].sort((a, b) => b - a).map(year => 
                  `<option value="${year}">${year}</option>`
                ).join('')}
              </select>
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ตั้งแต่)</label>
              <input type="number" id="filterBudgetMin" class="input input-bordered w-full text-sm" 
                     placeholder="เช่น 10000" onchange="filterProjects(event)">
            </div>
            <div class="shrink min-w-[140px] flex-1 max-w-[160px]">
              <label class="block text-sm font-medium mb-1">งบประมาณ (ถึง)</label>
              <input type="number" id="filterBudgetMax" class="input input-bordered w-full text-sm" 
                     placeholder="เช่น 1000000" onchange="filterProjects(event)">
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
      
      <!-- Projects Grid -->
      <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${renderProjectCards(DB.projects)}
      </div>
    </div>
  `;
  
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
  // Get all elements with same id and find the visible one
  const getVisibleElement = (id) => {
    const elements = document.querySelectorAll(`#${id}`);
    if (elements.length === 0) return null;
    if (elements.length === 1) return elements[0];
    
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (style.display !== 'none' && 
          style.visibility !== 'hidden' && 
          style.opacity !== '0' &&
          rect.width > 0 && 
          rect.height > 0 &&
          rect.top >= 0 &&
          rect.left >= 0) {
        return el;
      }
    }
    return elements[0];
  };
  
  // Get values from event target if available, otherwise use getVisibleElement
  const getValue = (id) => {
    if (event && event.target && event.target.id === id) {
      return event.target.value;
    }
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
  
  if (search) {
    projects = projects.filter(p => p.title.toLowerCase().includes(search));
  }
  
  if (orgFilter) {
    projects = projects.filter(p => p.orgId === orgFilter);
  }

  if (sdgFilter) {
    projects = projects.filter(p => (p.sdg || []).includes(sdgFilter));
  }

  if (yearFilter) {
    projects = projects.filter(p => p.year === yearFilter);
  }

  // Budget range filter
  if (budgetMin || budgetMax) {
    const min = budgetMin ? Number(budgetMin) : 0;
    const max = budgetMax ? Number(budgetMax) : Infinity;
    projects = projects.filter(p => {
      const budget = p.budget || 0;
      return budget >= min && budget <= max;
    });
  }

  // Date range: include projects whose [start..end] intersects [from..to]
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
  
  // Sort projects - get value from event target or find visible element
  let sortOrder = 'updatedAt-desc';
  if (event && event.target && event.target.id === 'projectSortOrder') {
    sortOrder = event.target.value || 'updatedAt-desc';
  } else {
    // Get all elements with same id and find the visible one
    const getVisibleElement = (id) => {
      const elements = document.querySelectorAll(`#${id}`);
      if (elements.length === 0) return null;
      if (elements.length === 1) return elements[0];
      
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (style.display !== 'none' && 
            style.visibility !== 'hidden' && 
            style.opacity !== '0' &&
            rect.width > 0 && 
            rect.height > 0 &&
            rect.top >= 0 &&
            rect.left >= 0) {
          return el;
        }
      }
      return elements[0];
    };
    
    const sortSelect = getVisibleElement('projectSortOrder');
    sortOrder = sortSelect?.value || 'updatedAt-desc';
  }
  
  if (sortOrder === 'updatedAt-desc') {
    projects.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  } else if (sortOrder === 'updatedAt-asc') {
    projects.sort((a, b) => (a.updatedAt || a.createdAt || 0) - (b.updatedAt || b.createdAt || 0));
  }
  
  document.getElementById('projectsGrid').innerHTML = renderProjectCards(projects);
}

function clearProjectFilters() {
  // Clear all elements with same id (both mobile and desktop)
  const clearAllElements = (id, defaultValue = '') => {
    const elements = document.querySelectorAll(`#${id}`);
    elements.forEach(el => {
      el.value = defaultValue;
      // Trigger change event to update UI
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
  
  // Call filterProjects after a short delay to ensure values are cleared
  setTimeout(() => {
    filterProjects();
  }, 10);
}

// ==================== Project Modal ====================
async function openProjectModal(projectId = null) {
  const project = projectId ? DB.projects.find(p => p.id === projectId) : null;
  
  const { value: formData } = await Swal.fire({
    title: project ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่',
    html: `
      <div class="space-y-4 text-left max-h-[500px] overflow-y-auto px-2">
        <div>
          <label class="block text-sm font-medium mb-2">ชื่อโครงการ</label>
          <input id="swal-title" class="input input-bordered w-full" 
                 value="${project?.title || ''}" placeholder="ระบุชื่อโครงการ">
        </div>
        
        ${session.role === 'admin' ? `
        <div>
          <label class="block text-sm font-medium mb-2">หน่วยงาน</label>
          <select id="swal-org" class="select select-bordered w-full">
            ${DB.orgs.map(o => `
              <option value="${o.id}" ${project?.orgId === o.id ? 'selected' : ''}>${o.name}</option>
            `).join('')}
          </select>
        </div>
        ` : ''}
        
        <div>
          <label class="block text-sm font-medium mb-2">งบประมาณ (บาท)</label>
          <input id="swal-budget" type="number" class="input input-bordered w-full" value="${project?.budget || ''}" placeholder="เช่น 50000">
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">ผู้รับผิดชอบ</label>
          <input id="swal-owner" class="input input-bordered w-full" 
                 value="${project?.owner || ''}" placeholder="ชื่อผู้รับผิดชอบ">
        </div>
        
        <div class="relative">
          <label class="block text-sm font-medium mb-2">ปีงบประมาณ</label>
          <input id="swal-year" type="text" class="input input-bordered w-full year-picker-input" 
                 value="${project?.year || ''}" placeholder="เช่น 2568" readonly
                 onclick="openYearPicker('swal-year')">
          <input type="hidden" id="swal-yearValue" value="${project?.year || ''}">
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">วันเริ่มต้น</label>
            <input id="swal-start" type="date" class="input input-bordered w-full" 
                   value="${project?.startDate || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">วันสิ้นสุด</label>
            <input id="swal-end" type="date" class="input input-bordered w-full" 
                   value="${project?.endDate || ''}">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">วัตถุประสงค์</label>
          <textarea id="swal-objective" class="textarea textarea-bordered w-full" 
                    rows="3" placeholder="อธิบายวัตถุประสงค์โครงการ">${project?.objective || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">นโยบาย/ข้อเสนอแนะ</label>
          <textarea id="swal-policy" class="textarea textarea-bordered w-full" 
                    rows="2" placeholder="นโยบายที่เกี่ยวข้อง">${project?.policy || ''}</textarea>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">SDG Target</label>
          <div class="grid grid-cols-2 gap-2">
            ${SDG_TARGETS.map(t => `
              <label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100">
                <input type="checkbox" class="checkbox checkbox-sm" value="${t.id}"
                       ${project?.sdg?.includes(t.id) ? 'checked' : ''}>
                <span class="text-sm">${t.id} - ${t.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">รูปกิจกรรม (สูงสุด 4 รูป)</label>
          <label id="swal-image-label" class="btn btn-outline btn-sm w-full cursor-pointer">
            <input type="file" id="swal-images" accept="image/*" multiple class="hidden">
            <span id="swal-image-count">เลือกรูปภาพ (${project?.images?.length || 0}/4)</span>
          </label>
          <div id="swal-image-preview" class="mt-2 grid grid-cols-2 gap-2">
            ${project?.images?.map(img => `
              <div class="relative">
                <img src="${img.dataUrl}" alt="${img.name}" class="w-full h-24 object-cover rounded border">
                <button type="button" onclick="removeImagePreview('${img.id}')" class="absolute top-1 right-1 btn btn-xs btn-error">×</button>
              </div>
            `).join('') || ''}
          </div>
        </div>
      </div>
    `,
    width: 800,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    confirmButtonColor: '#2563eb', // Use theme blue-600
    didOpen: () => {
      const fileInput = document.getElementById('swal-images');
      const previewDiv = document.getElementById('swal-image-preview');
      const countSpan = document.getElementById('swal-image-count');
      let selectedImages = project?.images ? [...project.images] : [];
      
      const updateCount = () => {
        if (countSpan) {
          countSpan.textContent = `เลือกรูปภาพ (${selectedImages.length}/4)`;
        }
      };
      
      const updatePreview = () => {
        if (!previewDiv) return;
        previewDiv.innerHTML = selectedImages.map(img => `
          <div class="relative">
            <img src="${img.dataUrl}" alt="${img.name}" class="w-full h-24 object-cover rounded border">
            <button type="button" onclick="removeImagePreview('${img.id}')" class="absolute top-1 right-1 btn btn-xs btn-error">×</button>
          </div>
        `).join('');
        updateCount();
      };
      
      fileInput?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (selectedImages.length + files.length > 4) {
          Swal.showValidationMessage('สามารถเพิ่มรูปได้สูงสุด 4 รูปเท่านั้น');
          return;
        }
        
        for (const file of files) {
          const dataUrl = await fileToDataURL(file);
          selectedImages.push({
            id: randomId('img'),
            name: file.name,
            dataUrl,
            createdAt: Date.now()
          });
        }
        updatePreview();
        e.target.value = '';
      });
      
      window.removeImagePreview = (imgId) => {
        selectedImages = selectedImages.filter(img => img.id !== imgId);
        updatePreview();
      };
      
      window.getSelectedImages = () => selectedImages;
      
      // Initialize count on load
      updateCount();
    },
    preConfirm: async () => {
      const title = document.getElementById('swal-title').value.trim();
      const budget = document.getElementById('swal-budget').value;
      const owner = document.getElementById('swal-owner').value.trim();
      const yearInput = document.getElementById('swal-yearValue')?.value || '';
      const year = yearInput ? Number(yearInput) : 2568;
      const startDate = document.getElementById('swal-start').value;
      const endDate = document.getElementById('swal-end').value;
      const objective = document.getElementById('swal-objective').value.trim();
      const policy = document.getElementById('swal-policy').value.trim();
      const orgId = session.role === 'admin' 
        ? document.getElementById('swal-org').value 
        : session.orgId;
      
      const sdg = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      
      if (!title) {
        Swal.showValidationMessage('กรุณาระบุชื่อโครงการ');
        return false;
      }

      const parsedBudget = budget === '' ? null : Number(budget);
      if (budget !== '' && (Number.isNaN(parsedBudget) || parsedBudget < 0)) {
        Swal.showValidationMessage('กรุณาระบุงบประมาณให้ถูกต้อง');
        return false;
      }
      
      const parsedYear = year ? Number(year) : 2568;
      
      const images = window.getSelectedImages ? window.getSelectedImages() : (project?.images || []);
      if (images.length > 4) {
        Swal.showValidationMessage('รูปภาพต้องไม่เกิน 4 รูป');
        return false;
      }

      if (!sdg.length) {
        Swal.showValidationMessage('กรุณาเลือกอย่างน้อย 1 SDG Target');
        return false;
      }
      
      return { title, budget: parsedBudget, owner, year: parsedYear, startDate, endDate, objective, policy, sdg, orgId, images };
    }
  });
  
  if (formData) {
    if (project) {
      const oldTitle = project.title;
      const oldImageCount = project.images?.length || 0;
      Object.assign(project, formData);
      project.updatedAt = Date.now();
      project.updatedBy = getCurrentUsername();
      
      const imageChange = (project.images?.length || 0) - oldImageCount;
      
      DB.audit = DB.audit || [];
      DB.audit.unshift({
        at: Date.now(),
        action: 'update_project',
        by: getCurrentUsername(),
        projectId: project.id,
        projectTitle: project.title,
        orgId: project.orgId,
        details: `แก้ไขโครงการ: ${oldTitle}${imageChange !== 0 ? ` (${imageChange > 0 ? '+' : ''}${imageChange} รูป)` : ''}`
      });
      
      showSuccess('อัปเดตสำเร็จ', 'โครงการถูกอัปเดตแล้ว');
    } else {
      const newProject = {
          id: randomId('p'),
        ...formData,
          images: formData.images || [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        updatedBy: getCurrentUsername()
        };
      DB.projects.push(newProject);
      
      DB.audit = DB.audit || [];
      DB.audit.unshift({
        at: Date.now(),
        action: 'create_project',
        by: getCurrentUsername(),
        projectId: newProject.id,
        projectTitle: newProject.title,
        orgId: newProject.orgId,
        details: `สร้างโครงการใหม่: ${newProject.title}${(newProject.images?.length || 0) > 0 ? ` (พร้อมรูป ${newProject.images.length} รูป)` : ''}`
      });
      
      showSuccess('สร้างสำเร็จ', `โครงการใหม่ถูกสร้างแล้ว${(newProject.images?.length || 0) > 0 ? ` พร้อมรูป ${newProject.images.length} รูป` : ''}`);
    }
        saveData();
    renderProjects();
  }
}

function renderProjectForm() {
  openProjectModal();
  navigateTo('projects');
}

// ==================== Project Detail ====================
async function viewProject(projectId) {
  const project = DB.projects.find(p => p.id === projectId);
  if (!project) {
    showError('ไม่พบโครงการ');
        return;
      }

  const editable = canEdit(project);
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
          <div>
            <p class="text-sm text-gray-500">หน่วยงาน</p>
            <p class="font-semibold">${getOrgName(project.orgId)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">งบประมาณ</p>
            <p class="font-semibold">${formatMoney(project.budget)} บาท</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">ผู้รับผิดชอบ</p>
            <p class="font-semibold">${project.owner || '-'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">ปีงบประมาณ</p>
            <p class="font-semibold">${project.year}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">วันเริ่มต้น</p>
            <p class="font-semibold">${formatDate(project.startDate)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">วันสิ้นสุด</p>
            <p class="font-semibold">${formatDate(project.endDate)}</p>
          </div>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 mb-2">วัตถุประสงค์</p>
          <p class="text-sm">${project.objective || '-'}</p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 mb-2">นโยบาย/ข้อเสนอแนะ</p>
          <p class="text-sm">${project.policy || '-'}</p>
        </div>
        
        <div>
          <p class="text-sm text-gray-500 mb-2">SDG Target</p>
          <div>${sdgBadges}</div>
            </div>
        
        <div>
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-500">รูปกิจกรรม (${project.images?.length || 0}/4)</p>
            ${editable ? `
              <label class="btn btn-sm btn-outline cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300">
                <i class="fas fa-plus mr-1.5"></i>เพิ่มรูป
                <input type="file" accept="image/*" multiple class="hidden" 
                       onchange="uploadProjectImages('${projectId}', this)">
              </label>
            ` : ''}
          </div>
          <div class="grid grid-cols-2 gap-4">
            ${project.images?.length > 0 
              ? project.images.map(img => `
                <div class="image-preview">
                  <img src="${img.dataUrl}" alt="${img.name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;">
                  <div class="overlay">
                    ${editable ? `
                      <button class="btn btn-sm btn-outline bg-white/90 hover:bg-white text-red-600 hover:text-red-700 border-red-300 backdrop-blur-sm" onclick="deleteProjectImage('${projectId}', '${img.id}')">
                        <i class="fas fa-trash mr-1.5"></i>ลบ
                      </button>
                    ` : ''}
                  </div>
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
  
  const uploadedCount = files.length;
  for (const file of files) {
    if ((project.images?.length || 0) >= 4) {
      showWarning('เกินจำนวน', 'สามารถเพิ่มรูปได้สูงสุด 4 รูปเท่านั้น');
      break;
    }
    
    const dataUrl = await fileToDataURL(file);
    if (!project.images) project.images = [];
    project.images.push({
      id: randomId('img'),
      name: file.name,
      dataUrl,
      createdAt: Date.now()
    });
  }
  
  project.updatedAt = Date.now();
  project.updatedBy = getCurrentUsername();
  
  DB.audit = DB.audit || [];
  DB.audit.unshift({
    at: Date.now(),
    action: 'upload_image',
    by: getCurrentUsername(),
    projectId: projectId,
    projectTitle: project.title,
    orgId: project.orgId,
    details: `อัปโหลดรูป ${uploadedCount} รูป: ${files.slice(0, uploadedCount).map(f => f.name).join(', ')}`
  });
  
  saveData();
  showSuccess('อัปโหลดสำเร็จ', `เพิ่มรูป ${uploadedCount} รูป`);
  
  Swal.close();
  viewProject(projectId);
}

async function deleteProjectImage(projectId, imageId) {
  const ok = await confirm('ลบรูปภาพ', 'ต้องการลบรูปภาพนี้ใช่หรือไม่?', 'ลบ');
  if (!ok) return;
  
  const project = DB.projects.find(p => p.id === projectId);
  if (project && project.images) {
    const image = project.images.find(img => img.id === imageId);
    const imageName = image?.name || 'unknown';
    
    project.images = project.images.filter(img => img.id !== imageId);
    project.updatedAt = Date.now();
    project.updatedBy = getCurrentUsername();
    
    DB.audit = DB.audit || [];
    DB.audit.unshift({
      at: Date.now(),
      action: 'delete_image',
      by: getCurrentUsername(),
      projectId: projectId,
      projectTitle: project.title,
      orgId: project.orgId,
      details: `ลบรูป: ${imageName}`
    });
    
    saveData();
    showSuccess('ลบสำเร็จ', 'รูปภาพถูกลบแล้ว');
    
    Swal.close();
    viewProject(projectId);
  }
}

async function deleteProject(projectId) {
  const project = DB.projects.find(p => p.id === projectId);
  if (!project) {
    showError('ไม่พบโครงการ');
    return;
  }
  
  // Check permission
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
    const projectTitle = project.title;
    const orgId = project.orgId;
    
    // Remove from DB
    const beforeCount = DB.projects.length;
    DB.projects = DB.projects.filter(p => p.id !== projectId);
    const afterCount = DB.projects.length;
    
    // Verify deletion
    if (beforeCount === afterCount) {
      showError('ลบไม่สำเร็จ', 'ไม่พบโครงการในระบบ');
      return;
    }
    
    DB.audit = DB.audit || [];
    DB.audit.unshift({
      at: Date.now(),
      action: 'delete_project',
      by: getCurrentUsername(),
      projectId: projectId,
      projectTitle: projectTitle,
      orgId: orgId,
      details: `ลบโครงการ: ${projectTitle}`
    });
    
    saveData();
    showSuccess('ลบสำเร็จ', 'โครงการถูกลบแล้ว');
    
    // Force re-render the current page
    if (currentPage === 'projects' || currentPage === 'projects-all') {
      renderProjects();
    } else {
      // If we're on another page, navigate back to projects
      navigateTo('projects');
    }
  }
}

// ==================== Audit Log Page (Admin) ====================
function renderAuditLog() {
  const content = document.getElementById('pageContent');
  if (session?.role !== 'admin') {
    content.innerHTML = '<div class="page"><div class="stat-card"><div class="alert alert-error"><i class="fas fa-ban"></i><span>เฉพาะผู้ดูแลระบบเท่านั้น</span></div></div></div>';
    return;
  }

  // Don't sort here - let filterAuditLog() handle sorting
  const auditLogs = (DB.audit || []).slice();
  
  const actionLabels = {
    'create_project': 'สร้างโครงการ',
    'update_project': 'แก้ไขโครงการ',
    'delete_project': 'ลบโครงการ',
    'upload_image': 'อัปโหลดรูป',
    'delete_image': 'ลบรูป',
    'delete_org': 'ลบหน่วยงาน',
    'delete_org_cascade': 'ลบหน่วยงาน (พร้อมข้อมูล)',
    'set_org_pin': 'ตั้ง PIN หน่วยงาน',
    'change_admin_password': 'เปลี่ยนรหัสผ่าน Admin'
  };
  
  const actionColors = {
    'create_project': 'badge-success',
    'update_project': 'badge-info',
    'delete_project': 'badge-error',
    'upload_image': 'badge-success',
    'delete_image': 'badge-warning',
    'delete_org': 'badge-error',
    'delete_org_cascade': 'badge-error',
    'set_org_pin': 'badge-info',
    'change_admin_password': 'badge-info'
  };

  // Get unique users for filter
  const allUsers = [...new Set((DB.audit || []).map(log => log.by).filter(Boolean))].sort();
  
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

      <!-- Filter -->
      <div class="stat-card mb-6 filter-sticky">
        <!-- Mobile: Collapsible filter -->
        <details class="lg:hidden">
          <summary class="cursor-pointer btn btn-outline btn-sm w-full justify-between mb-4">
            <span><i class="fas fa-filter mr-2"></i>ตัวกรอง</span>
            <i class="fas fa-chevron-down transition-transform"></i>
          </summary>
          <div class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">ตั้งแต่เวลา</label>
                <input type="datetime-local" id="auditFilterFrom" class="input input-bordered w-full" 
                       onchange="filterAuditLog(event)" oninput="filterAuditLog(event)">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">กรองการกระทำ</label>
                <select id="auditFilterAction" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                  <option value="">ทั้งหมด</option>
                  ${Object.entries(actionLabels).map(([key, label]) => 
                    `<option value="${key}">${label}</option>`
                  ).join('')}
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
        
        <!-- Desktop: Always visible filter -->
        <div class="hidden lg:block">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">ตั้งแต่เวลา</label>
              <input type="datetime-local" id="auditFilterFrom" class="input input-bordered w-full" 
                     onchange="filterAuditLog(event)" oninput="filterAuditLog(event)">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">กรองการกระทำ</label>
              <select id="auditFilterAction" class="select select-bordered w-full" onchange="filterAuditLog(event)">
                <option value="">ทั้งหมด</option>
                ${Object.entries(actionLabels).map(([key, label]) => 
                  `<option value="${key}">${label}</option>`
                ).join('')}
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
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                const actionLabel = actionLabels[log.action] || log.action;
                const actionColor = actionColors[log.action] || 'badge-neutral';
                // Get background and text colors from badge class using softer CSS variables
                const bgColorMap = {
                  'badge-success': 'var(--badge-success-bg)',
                  'badge-info': 'var(--badge-info-bg)',
                  'badge-error': 'var(--badge-error-bg)',
                  'badge-warning': 'var(--badge-warning-bg)',
                  'badge-neutral': 'var(--badge-neutral-bg)'
                };
                const textColorMap = {
                  'badge-success': 'var(--badge-success-text)',
                  'badge-info': 'var(--badge-info-text)',
                  'badge-error': 'var(--badge-error-text)',
                  'badge-warning': 'var(--badge-warning-text)',
                  'badge-neutral': 'var(--badge-neutral-text)'
                };
                const bgColor = bgColorMap[actionColor] || 'var(--badge-neutral-bg)';
                const textColor = textColorMap[actionColor] || 'var(--badge-neutral-text)';
                const projectTitle = log.projectTitle ? `<div class="font-medium">${log.projectTitle}</div>` : '';
                const orgName = log.orgId ? `<div class="text-xs text-gray-500">${getOrgName(log.orgId)}</div>` : '';
                
                return `
                  <tr>
                    <td class="text-sm whitespace-nowrap">${timeStr}</td>
                    <td class="font-medium whitespace-nowrap">${getDisplayNameFromUsername(log.by)}</td>
                    <td>
                      <span class="badge-inline" style="background-color: ${bgColor}; color: ${textColor};">${actionLabel}</span>
                    </td>
                    <td>
                      ${projectTitle}
                      ${orgName}
                    </td>
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
  
  // Store original logs for filtering
  window.allAuditLogs = auditLogs;
  filterAuditLog();
}

function filterAuditLog(event) {
  // Get all elements with same id and find the visible one
  const getVisibleElement = (id) => {
    const elements = document.querySelectorAll(`#${id}`);
    if (elements.length === 0) return null;
    if (elements.length === 1) return elements[0];
    
    // Check which element is visible by checking computed style and bounding rect
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      // Element is visible if it's not hidden and has dimensions
      if (style.display !== 'none' && 
          style.visibility !== 'hidden' && 
          style.opacity !== '0' &&
          rect.width > 0 && 
          rect.height > 0 &&
          rect.top >= 0 &&
          rect.left >= 0) {
        return el;
      }
    }
    // Fallback: return first element
    return elements[0];
  };
  
  // If event is provided, try to get value from the element that triggered the event
  let fromInput, actionSelect, bySelect, sortSelect;
  
  if (event && event.target) {
    const targetId = event.target.id;
    if (targetId === 'auditFilterFrom') {
      fromInput = event.target;
    } else if (targetId === 'auditFilterAction') {
      actionSelect = event.target;
    } else if (targetId === 'auditFilterBy') {
      bySelect = event.target;
    } else if (targetId === 'auditSortOrder') {
      sortSelect = event.target;
    }
  }
  
  // Get other elements if not set from event
  if (!fromInput) fromInput = getVisibleElement('auditFilterFrom');
  if (!actionSelect) actionSelect = getVisibleElement('auditFilterAction');
  if (!bySelect) bySelect = getVisibleElement('auditFilterBy');
  if (!sortSelect) sortSelect = getVisibleElement('auditSortOrder');
  
  const actionFilter = actionSelect?.value || '';
  const byFilter = bySelect?.value || '';
  const sortOrder = sortSelect?.value || 'newest';
  const fromValue = fromInput?.value || '';
  
  let filtered = (window.allAuditLogs || []).slice();
  
  // Filter by time (from)
  if (fromValue) {
    const fromDate = new Date(fromValue).getTime();
    filtered = filtered.filter(log => {
      const logTime = typeof log.at === 'number' ? log.at : new Date(log.at).getTime();
      return logTime >= fromDate;
    });
  }
  
  // Filter by action
  if (actionFilter) {
    filtered = filtered.filter(log => log.action === actionFilter);
  }
  
  // Filter by user
  if (byFilter) {
    filtered = filtered.filter(log => log.by === byFilter);
  }
  
  // Sort by time - ensure we're comparing timestamps correctly
  if (sortOrder === 'newest' || sortOrder === '') {
    filtered.sort((a, b) => {
      const aTime = typeof a.at === 'number' ? a.at : new Date(a.at).getTime();
      const bTime = typeof b.at === 'number' ? b.at : new Date(b.at).getTime();
      return bTime - aTime; // ใหม่ → เก่า
    });
  } else if (sortOrder === 'oldest') {
    filtered.sort((a, b) => {
      const aTime = typeof a.at === 'number' ? a.at : new Date(a.at).getTime();
      const bTime = typeof b.at === 'number' ? b.at : new Date(b.at).getTime();
      return aTime - bTime; // เก่า → ใหม่
    });
  }
  
  // Update count
  const countEl = document.getElementById('auditTotalCount');
  if (countEl) countEl.textContent = filtered.length;
  
  // Render filtered logs
  const tbody = document.getElementById('auditLogTableBody');
  if (!tbody) return;
  
  const actionLabels = {
    'create_project': 'สร้างโครงการ',
    'update_project': 'แก้ไขโครงการ',
    'delete_project': 'ลบโครงการ',
    'upload_image': 'อัปโหลดรูป',
    'delete_image': 'ลบรูป',
    'delete_org': 'ลบหน่วยงาน',
    'delete_org_cascade': 'ลบหน่วยงาน (พร้อมข้อมูล)',
    'set_org_pin': 'ตั้ง PIN หน่วยงาน',
    'change_admin_password': 'เปลี่ยนรหัสผ่าน Admin'
  };
  
  const actionColors = {
    'create_project': 'badge-success',
    'update_project': 'badge-info',
    'delete_project': 'badge-error',
    'upload_image': 'badge-success',
    'delete_image': 'badge-warning',
    'delete_org': 'badge-error',
    'delete_org_cascade': 'badge-error',
    'set_org_pin': 'badge-info',
    'change_admin_password': 'badge-info'
  };
  
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
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const actionLabel = actionLabels[log.action] || log.action;
    const actionColor = actionColors[log.action] || 'badge-neutral';
    // Get background and text colors from badge class using softer CSS variables
    const bgColorMap = {
      'badge-success': 'var(--badge-success-bg)',
      'badge-info': 'var(--badge-info-bg)',
      'badge-error': 'var(--badge-error-bg)',
      'badge-warning': 'var(--badge-warning-bg)',
      'badge-neutral': 'var(--badge-neutral-bg)'
    };
    const textColorMap = {
      'badge-success': 'var(--badge-success-text)',
      'badge-info': 'var(--badge-info-text)',
      'badge-error': 'var(--badge-error-text)',
      'badge-warning': 'var(--badge-warning-text)',
      'badge-neutral': 'var(--badge-neutral-text)'
    };
    const bgColor = bgColorMap[actionColor] || 'var(--badge-neutral-bg)';
    const textColor = textColorMap[actionColor] || 'var(--badge-neutral-text)';
    const projectTitle = log.projectTitle ? `<div class="font-medium">${log.projectTitle}</div>` : '';
    const orgName = log.orgId ? `<div class="text-xs text-gray-500">${getOrgName(log.orgId)}</div>` : '';
    
    return `
      <tr>
        <td class="text-sm">${timeStr}</td>
        <td class="font-medium">${getDisplayNameFromUsername(log.by)}</td>
        <td>
          <span class="badge-inline" style="background-color: ${bgColor}; color: ${textColor};">${actionLabel}</span>
        </td>
        <td>
          ${projectTitle}
          ${orgName}
        </td>
        <td class="text-sm text-gray-600">${log.details || '-'}</td>
      </tr>
    `;
  }).join('');
}

function clearAuditFilters() {
  // Clear all elements with same id (both mobile and desktop)
  const clearAllElements = (id, defaultValue = '') => {
    const elements = document.querySelectorAll(`#${id}`);
    elements.forEach(el => {
      el.value = defaultValue;
      // Trigger change event to update UI
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };
  
  clearAllElements('auditFilterFrom', '');
  clearAllElements('auditFilterAction', '');
  clearAllElements('auditFilterBy', '');
  clearAllElements('auditSortOrder', 'newest');
  
  // Call filterAuditLog after a short delay to ensure values are cleared
  setTimeout(() => {
    filterAuditLog();
  }, 10);
}

// ==================== Users Page (Admin) ====================
function renderUsers() {
  const content = document.getElementById('pageContent');
  if (session?.role !== 'admin') {
    content.innerHTML = '<div class="page"><div class="stat-card"><div class="alert alert-error"><i class="fas fa-ban"></i><span>เฉพาะผู้ดูแลระบบเท่านั้น</span></div></div></div>';
    return;
  }

  ensureOrgPins(DB);
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
    confirmButtonColor: '#2563eb', // Use theme blue-600
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
    org.pin = pin;
    ensureOrgPins(DB); // sync manager password
    DB.audit = DB.audit || [];
    DB.audit.unshift({ at: Date.now(), action: 'set_org_pin', by: getCurrentUsername(), orgId });
    saveData();
    showSuccess('บันทึกสำเร็จ', 'PIN หน่วยงานถูกอัปเดตแล้ว');
    renderUsers();
  }
}


// ==================== Theme ====================
// Dark mode removed for demo (fixed light theme)
document.documentElement.setAttribute('data-theme', 'light');
try { localStorage.removeItem('sdg4_theme'); } catch {}

// ==================== Init ====================
if (session) {
  initApp();
      } else {
  initLogin();
    }