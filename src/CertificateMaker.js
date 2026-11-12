import './Section.css';
import './Game.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PROJECTS, ROLES, OTHER, LIMITS, TEMPLATES, SIZES, SIGNER_NAME, SIGNER, DEFAULT_DESIGN,
  sizeOf, todayIso, buildCertificate, randomLook, drawCertificate, loadCertificateFonts,
} from './game/certificate';
import { readMember } from './game/fanCard';
import { readName } from './game/leaderboard';

const FILE_NAME = 'cartoon-certificate.png';

const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

// ชื่อเริ่มต้น: ใช้ชื่อจากบัตรแฟนคลับหรือตารางอันดับที่เคยกรอกไว้ในเครื่อง
const initialForm = () => {
  const member = readMember();
  return {
    name: member ? member.name : readName(),
    project: PROJECTS[0],
    projectOther: '',
    role: ROLES[0],
    roleOther: '',
    date: todayIso(),
    message: 'ขอบคุณที่เป็นส่วนหนึ่งของความสำเร็จครั้งนี้',
    signer: SIGNER_NAME,
    signerTitle: SIGNER,
  };
};

// ตัวเลือกแบบเลือกได้อันเดียว (แบบเกียรติบัตร / ขนาด)
function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <div className="look-group" role="radiogroup" aria-label={label}>
      <span className="look-label">{label}</span>
      <div className="look-choices">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            className={`look-choice${value === option.id ? ' is-on' : ''}`}
            onClick={() => onChange(option.id)}
          >
            {option.swatch && <span className="look-swatch" style={{ background: option.swatch }} aria-hidden="true" />}
            {option.label}
            {option.hint && <small className="cert-hint">{option.hint}</small>}
          </button>
        ))}
      </div>
    </div>
  );
}

// select ที่มีตัวเลือก "อื่น ๆ (พิมพ์เอง)" เลือกแล้วมีช่องให้พิมพ์
function SelectOrOther({ id, label, options, value, other, max, placeholder, onChange, onOther }) {
  return (
    <div className="cert-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
        <option value={OTHER}>อื่น ๆ (พิมพ์เอง)</option>
      </select>
      {value === OTHER && (
        <input
          type="text"
          value={other}
          maxLength={max}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => onOther(event.target.value)}
        />
      )}
    </div>
  );
}

const DESIGN_COLORS = [
  { key: 'bg', label: 'สีพื้น' },
  { key: 'accent', label: 'สีเน้น' },
  { key: 'ink', label: 'สีตัวหนังสือ' },
];

// ตัวเลือกของแบบ "ออกแบบเอง": สี กรอบ ตราประทับ และภาพพื้นหลังที่ออกแบบมาเอง
function DesignPanel({ design, size, onChange, onImage }) {
  const { width, height } = sizeOf(size);
  return (
    <fieldset className="cert-design">
      <legend>ออกแบบเอง</legend>
      <div className="cert-design-colors">
        {DESIGN_COLORS.map(({ key, label }) => (
          <label key={key} className="cert-color">
            <input type="color" value={design[key]} onChange={(event) => onChange({ ...design, [key]: event.target.value })} />
            {label}
          </label>
        ))}
      </div>
      <label className="cert-check">
        <input type="checkbox" checked={design.frame} onChange={(event) => onChange({ ...design, frame: event.target.checked })} />
        กรอบและดาวมุม
      </label>
      <label className="cert-check">
        <input type="checkbox" checked={design.seal} onChange={(event) => onChange({ ...design, seal: event.target.checked })} />
        ตราประทับ
      </label>
      <div className="cert-field cert-photo">
        <label htmlFor="cert-background">ภาพพื้นหลังที่ออกแบบเอง (ไม่บังคับ)</label>
        <input id="cert-background" type="file" accept="image/*" onChange={onImage} />
        {design.image && (
          <button type="button" className="hand-link cert-photo-clear" onClick={() => onChange({ ...design, image: null })}>เอาภาพพื้นหลังออก</button>
        )}
        <p className="fan-card-meta">ขนาดที่พอดีกับขนาดนี้คือ {width} × {height} px · เว้นกลางภาพไว้ให้ตัวหนังสือ</p>
      </div>
    </fieldset>
  );
}

// ทำเกียรติบัตรผู้ร่วมโปรเจกต์: กรอกข้อมูล → เห็นตัวอย่างทันที → บันทึกรูปหรือแชร์
function CertificateMaker() {
  const canvasRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [template, setTemplate] = useState(TEMPLATES[0].id);
  const [size, setSize] = useState(SIZES[0].id);
  const [photo, setPhoto] = useState(null);
  const [design, setDesign] = useState(DEFAULT_DESIGN);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [canDraw, setCanDraw] = useState(true);

  const data = useMemo(() => buildCertificate(form), [form]);
  const { width, height } = sizeOf(size);

  const update = (key) => (value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setNote('');
    setError('');
  };

  // วาดใหม่ทุกครั้งที่ข้อมูล แบบ ขนาด หรือรูปเปลี่ยน (รอฟอนต์ก่อน)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    if (!ctx) {
      setCanDraw(false);
      return undefined;
    }
    let alive = true;
    loadCertificateFonts().then(() => { if (alive) drawCertificate(ctx, data, { template, size, photo, design }); });
    return () => { alive = false; };
  }, [data, template, size, photo, design]);

  // เปิดรูปที่ผู้ใช้เลือก รูปอยู่ในเครื่องผู้ใช้เท่านั้น ไม่ถูกอัปโหลด
  const loadImage = (event, onLoaded) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      onLoaded(image);
      setError('');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError('เปิดรูปนี้ไม่ได้ ลองรูปอื่นนะ');
    };
    image.src = url;
    event.target.value = '';
  };

  // ใส่รูปโปรไฟล์แล้วสลับไปแบบบัตรสมาชิกให้เลย (แบบเดียวที่ใช้รูป)
  const handlePhoto = (event) => loadImage(event, (image) => { setPhoto(image); setTemplate('card'); });
  const handleBackground = (event) => loadImage(event, (image) => setDesign((previous) => ({ ...previous, image })));

  // ต้องมีชื่อจริงก่อนบันทึก ไม่งั้นจะได้เกียรติบัตรที่เขียนว่า "ชื่อของคุณ"
  const ready = () => {
    if (form.name.trim()) return true;
    setError('ใส่ชื่อก่อนนะ');
    return false;
  };

  const handleRandom = () => {
    const look = randomLook({ template, design });
    setTemplate(look.template);
    setDesign(look.design);
  };

  const handleSave = async () => {
    if (!ready()) return;
    const blob = await toBlob(canvasRef.current);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = FILE_NAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNote('บันทึกรูปแล้ว ถ้าใช้มือถือ รูปจะอยู่ในไฟล์ดาวน์โหลด หรือกดค้างที่รูปเพื่อบันทึกลงอัลบั้ม');
  };

  const handleShare = async () => {
    if (!ready()) return;
    const blob = await toBlob(canvasRef.current);
    if (!blob) return;
    const file = new File([blob], FILE_NAME, { type: 'image/png' });
    try {
      await navigator.share({ files: [file], text: 'เกียรติบัตรผู้ร่วมโปรเจกต์ซัพพอร์ตน้องการ์ตูน ♡ #StandByToon' });
    } catch (e) {
      // ผู้ใช้กดยกเลิกการแชร์
    }
  };

  const canShareFiles = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'
    && typeof File === 'function' && navigator.canShare({ files: [new File([''], FILE_NAME, { type: 'image/png' })] });

  return (
    <section className="section game cert-page">
      <h1 className="visually-hidden">ทำเกียรติบัตรผู้ร่วมโปรเจกต์</h1>
      <Link to="/game" className="hand-link game-back">← เกมทั้งหมด</Link>

      <div className="cert-studio">
        <form className="sheet cert-form" onSubmit={(event) => event.preventDefault()}>
          <span className="tape tape-center" aria-hidden="true" />
          <h2 className="quiz-title">ทำเกียรติบัตร</h2>
          {/* <p className="cert-lead">สำหรับทุกคนที่ร่วมโปรเจกต์ซัพพอร์ตน้องการ์ตูน</p> */}

          <div className="cert-field">
            <label htmlFor="cert-name">ชื่อที่จะอยู่บนเกียรติบัตร</label>
            <input
              id="cert-name"
              type="text"
              value={form.name}
              maxLength={LIMITS.name}
              placeholder="ชื่อ ชื่อเล่น หรือแฮนเดิล"
              autoComplete="nickname"
              onChange={(event) => update('name')(event.target.value)}
            />
          </div>

          <SelectOrOther
            id="cert-project"
            label="โปรเจกต์ที่ร่วม"
            options={PROJECTS}
            value={form.project}
            other={form.projectOther}
            max={LIMITS.project}
            placeholder="พิมพ์ชื่อโปรเจกต์"
            onChange={update('project')}
            onOther={update('projectOther')}
          />
          <SelectOrOther
            id="cert-role"
            label="บทบาท"
            options={ROLES}
            value={form.role}
            other={form.roleOther}
            max={LIMITS.role}
            placeholder="พิมพ์บทบาท"
            onChange={update('role')}
            onOther={update('roleOther')}
          />

          <div className="cert-field">
            <label htmlFor="cert-date">วันที่</label>
            <input id="cert-date" type="date" value={form.date} onChange={(event) => update('date')(event.target.value)} />
          </div>

          <div className="cert-field">
            <label htmlFor="cert-message">ข้อความเพิ่มเติม (ไม่บังคับ)</label>
            <textarea
              id="cert-message"
              value={form.message}
              maxLength={LIMITS.message}
              rows={2}
              placeholder="เช่น ขอบคุณที่เป็นส่วนหนึ่งของความสำเร็จ"
              onChange={(event) => update('message')(event.target.value)}
            />
          </div>

          <div className="cert-field">
            <label htmlFor="cert-signer">ผู้ลงนาม</label>
            <input
              id="cert-signer"
              type="text"
              value={form.signer}
              maxLength={LIMITS.signer}
              placeholder={SIGNER_NAME}
              onChange={(event) => update('signer')(event.target.value)}
            />
          </div>

          <div className="cert-field">
            <label htmlFor="cert-signer-title">ตำแหน่งหรือทีมของผู้ลงนาม (เว้นว่างได้)</label>
            <input
              id="cert-signer-title"
              type="text"
              value={form.signerTitle}
              maxLength={LIMITS.signerTitle}
              placeholder="เช่น หัวหน้าโปรเจกต์"
              onChange={(event) => update('signerTitle')(event.target.value)}
            />
          </div>

          <ChoiceGroup label="แบบ" options={TEMPLATES} value={template} onChange={setTemplate} />
          <button type="button" className="look-choice cert-random" onClick={handleRandom}>สุ่มแบบ</button>
          <ChoiceGroup label="ขนาด" options={SIZES} value={size} onChange={setSize} />
          {template === 'custom' && <DesignPanel design={design} size={size} onChange={setDesign} onImage={handleBackground} />}

          <div className="cert-field cert-photo">
            <label htmlFor="cert-photo">รูปโปรไฟล์ (ใช้กับแบบบัตรสมาชิก)</label>
            <input id="cert-photo" type="file" accept="image/*" onChange={handlePhoto} />
            {photo && (
              <button type="button" className="hand-link cert-photo-clear" onClick={() => setPhoto(null)}>เอารูปออก</button>
            )}
            <p className="fan-card-meta">รูปอยู่ในเครื่องของคุณเท่านั้น ไม่ถูกส่งไปที่ไหน</p>
          </div>
        </form>

        <div className="cert-result">
          {canDraw ? (
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="cert-canvas"
              style={{ aspectRatio: `${width} / ${height}` }}
              role="img"
              aria-label={`เกียรติบัตรของ ${data.name} ${data.role} ใน${data.project} เลขที่ ${data.serial}`}
            />
          ) : (
            <p className="leaderboard-empty">เครื่องนี้วาดเกียรติบัตรไม่ได้ ลองเปิดด้วยเบราว์เซอร์อื่น</p>
          )}
          {error && <p className="leaderboard-message" role="alert">{error}</p>}
          {canDraw && (
            <div className="game-actions">
              <button type="button" className="game-btn" onClick={handleSave}>บันทึกรูป</button>
              {canShareFiles && (
                <button type="button" className="game-btn game-btn-secondary" onClick={handleShare}>แชร์</button>
              )}
            </div>
          )}
          {note && <p className="fan-card-meta" role="status">{note}</p>}
          <p className="fan-card-meta">เลขที่ {data.serial} · ข้อมูลเดิมได้เลขเดิมเสมอ</p>
        </div>
      </div>
    </section>
  );
}

export default CertificateMaker;
