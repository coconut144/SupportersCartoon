import {
  PROJECTS, ROLES, OTHER, LIMITS, SIZES, TEMPLATES, SIGNER_NAME, SIGNER, DEFAULT_DESIGN,
  sizeOf, cleanText, makeSerial, buildCertificate, wrapLines, initialOf, normalizeDesign, randomLook, PALETTES,
} from './certificate';

// วัดความกว้างแบบง่าย: ตัวอักษรละ 10 หน่วย
const measure = (text) => [...text].length * 10;

test('ข้อความถูกตัดช่องว่างซ้ำ อักขระควบคุม และความยาว', () => {
  expect(cleanText('  มิว \n  ตูน ', 40)).toBe('มิว ตูน');
  expect([...cleanText('ก'.repeat(100), LIMITS.name)]).toHaveLength(LIMITS.name);
  expect(cleanText(undefined, 10)).toBe('');
});

test('เลขที่บัตร: ข้อมูลเดิมได้เลขเดิม ข้อมูลต่างได้เลขต่าง', () => {
  const serial = makeSerial('มิว', PROJECTS[0], '2026-11-12');
  expect(serial).toMatch(/^CTN-2026-[0-9A-Z]{6}$/);
  expect(makeSerial('มิว', PROJECTS[0], '2026-11-12')).toBe(serial);
  expect(makeSerial('มิว', PROJECTS[1], '2026-11-12')).not.toBe(serial);
  expect(makeSerial('มิวมิว', PROJECTS[0], '2026-11-12')).not.toBe(serial);
});

test('รวมข้อมูลจากฟอร์ม: วันที่เป็นแบบไทย และเลือก "อื่น ๆ" ใช้ข้อความที่พิมพ์เอง', () => {
  const data = buildCertificate({
    name: ' มิว ', project: OTHER, projectOther: 'โปรเจกต์ป้ายไฟ', role: ROLES[1], roleOther: 'ไม่ใช้', date: '2026-11-12', message: '',
  });
  expect(data.name).toBe('มิว');
  expect(data.project).toBe('โปรเจกต์ป้ายไฟ');
  expect(data.role).toBe(ROLES[1]);
  expect(data.date).toMatch(/12 พฤศจิกายน (พ\.ศ\. )?2569/);
  expect(data.serial).toBe(makeSerial('มิว', 'โปรเจกต์ป้ายไฟ', '2026-11-12'));
});

test('ช่องว่างหรือวันที่เสียใช้ค่าเริ่มต้นแทน', () => {
  const data = buildCertificate(
    { name: '', project: OTHER, projectOther: '  ', role: ROLES[0], date: 'เมื่อวาน' },
    new Date(2026, 10, 12, 9),
  );
  expect(data.name).toBe('ชื่อของคุณ');
  expect(data.project).toBe('…');
  expect(data.isoDate).toBe('2026-11-12');
});

test('ตัดบรรทัดระหว่างคำก่อน ไม่ตัดกลางคำ', () => {
  const words = ['ขอบคุณ', 'ที่', 'เป็น', 'ส่วนหนึ่ง', 'ของ', 'ความสำเร็จ'];
  const lines = wrapLines(words.join(''), measure, 130, 5, words);
  expect(lines).toEqual(['ขอบคุณที่เป็น', 'ส่วนหนึ่งของ', 'ความสำเร็จ']);
});

test('คำที่ยาวเกินบรรทัดถูกตัดกลางคำ และบรรทัดที่เกินลงท้ายด้วย …', () => {
  expect(wrapLines('abcdefghij', measure, 40, 5, ['abcdefghij'])).toEqual(['abcd', 'efgh', 'ij']);
  const lines = wrapLines('aaaa bbbb cccc dddd', measure, 50, 2, ['aaaa', ' ', 'bbbb', ' ', 'cccc', ' ', 'dddd']);
  expect(lines).toHaveLength(2);
  expect(lines[1].endsWith('…')).toBe(true);
});

test('ตัวอักษรแรกของชื่อข้ามสระหน้า', () => {
  expect(initialOf('เมย์')).toBe('ม');
  expect(initialOf('Cartoon')).toBe('C');
  expect(initialOf('')).toBe('♡');
});

test('ขนาดที่ไม่รู้จักใช้ขนาดแรก', () => {
  expect(sizeOf('ig').portrait).toBe(true);
  expect(sizeOf('poster')).toBe(SIZES[0]);
});

test('ผู้ลงนามแก้ได้: ชื่อว่างใช้ค่าเริ่มต้น ตำแหน่งเว้นว่างได้', () => {
  const base = { name: 'มิว', project: PROJECTS[0], role: ROLES[0], date: '2026-11-12' };
  expect(buildCertificate(base)).toMatchObject({ signer: SIGNER_NAME, signerTitle: SIGNER });
  expect(buildCertificate({ ...base, signer: ' พี่มิว ', signerTitle: 'หัวหน้าโปรเจกต์' }))
    .toMatchObject({ signer: 'พี่มิว', signerTitle: 'หัวหน้าโปรเจกต์' });
  expect(buildCertificate({ ...base, signer: '  ', signerTitle: '' })).toMatchObject({ signer: SIGNER_NAME, signerTitle: '' });
  expect([...buildCertificate({ ...base, signer: 'ก'.repeat(99) }).signer]).toHaveLength(LIMITS.signer);
});

test('แบบออกแบบเอง: มีในรายการแบบ และสีที่ไม่ถูกต้องกลับเป็นค่าเริ่มต้น', () => {
  expect(TEMPLATES.map((template) => template.id)).toContain('custom');
  expect(normalizeDesign(null)).toEqual(DEFAULT_DESIGN);
  expect(normalizeDesign({ bg: '#123ABC', accent: 'red', ink: 'url(x)', frame: false, seal: false, image: {} }))
    .toEqual({ ...DEFAULT_DESIGN, bg: '#123ABC', frame: false, seal: false });
  const image = { width: 100, height: 80 };
  expect(normalizeDesign({ image }).image).toBe(image);
});

test('สุ่มแบบ: ได้แบบที่ไม่ซ้ำกับที่ใช้อยู่ และคงภาพพื้นหลัง กรอบ ตราประทับเดิมไว้', () => {
  expect(randomLook({ template: 'classic' }, () => 0).template).toBe('pastel');
  const image = { width: 10, height: 10 };
  const current = { template: 'custom', design: { ...DEFAULT_DESIGN, ...PALETTES[0], frame: false, image } };
  for (let i = 0; i < 20; i += 1) {
    const look = randomLook(current, () => i / 20);
    expect(TEMPLATES.map((template) => template.id)).toContain(look.template);
    expect(look.design).toMatchObject({ frame: false, seal: true, image });
    expect(look.template === 'custom' && look.design.bg === PALETTES[0].bg && look.design.accent === PALETTES[0].accent).toBe(false);
  }
  expect(randomLook(current, () => 0.999)).toMatchObject({ template: 'custom', design: PALETTES[PALETTES.length - 1] });
});

test('ชุดสีสำเร็จรูปเป็นสีแบบ #rrggbb ทั้งหมด', () => {
  PALETTES.forEach((palette) => expect(normalizeDesign(palette)).toMatchObject(palette));
});
