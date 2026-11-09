// ควิซ "รู้จักน้องการ์ตูนแค่ไหน?": สร้างคำถามจากไฟล์ข้อมูลของเว็บ (artist.json, videos.json)
// ข้อมูลน้องเปลี่ยน คำตอบก็เปลี่ยนตาม ตัวเลือกหลอกเขียนไว้ที่นี่และจะตัดคำตอบจริงออกให้เสมอ

import artist from '../data/artist.json';
import videos from '../data/videos.json';
import { formatDate } from '../data/format';

export const QUESTION_COUNT = 10;

const categoryItems = (title) => {
  const category = videos.categories.find((c) => c.title === title);
  return category ? category.items : [];
};

// ชื่อเพลงจาก "จะยังไงก็รักเธอ (MV full)" → "จะยังไงก็รักเธอ"
const songOf = (title) => title.replace(/\s*\(.*\)\s*$/, '').trim();
// ชื่อรายการจาก "ดูออกนะคะ EP.49 ..." → "ดูออกนะคะ"
const showOf = (title) => title.split(/\s+EP\./)[0].trim();

function shiftedDates(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const pad = (n) => String(n).padStart(2, '0');
  const prevMonth = m === 1 ? 12 : m - 1;
  return [
    `${y}-${pad(prevMonth)}-${pad(d)}`,
    `${y}-${pad(m)}-${pad(d > 10 ? d - 10 : d + 10)}`,
    `${y + 1}-${pad(m)}-${pad(d)}`,
  ].map((date) => formatDate(date, 'th-TH', 'long'));
}

const pickFrom = (list, rng) => list[Math.floor(rng() * list.length)];

// แต่ละข้อ: { id, question, answer, distractors }
function questionBank(rng) {
  const mv = categoryItems('Music Video')[0];
  const variety = categoryItems('Variety')[0];
  const noodle = artist.likes.find((like) => like.includes('ก๋วยเตี๋ยว'));
  const animal = artist.likes.find((like) => !like.includes('ก๋วยเตี๋ยว') && like !== artist.likes[0]) || artist.likes[0];

  return [
    {
      id: 'birthday',
      question: 'น้องการ์ตูนเกิดวันที่เท่าไร?',
      answer: formatDate(artist.birthDate, 'th-TH', 'long'),
      distractors: shiftedDates(artist.birthDate),
    },
    {
      id: 'height',
      question: 'น้องการ์ตูนสูงเท่าไร?',
      answer: `${artist.heightCm} ซม.`,
      distractors: [-5, -3, 3, 5].map((dx) => `${artist.heightCm + dx} ซม.`),
    },
    {
      id: 'blood',
      question: 'น้องการ์ตูนกรุ๊ปเลือดอะไร?',
      answer: artist.bloodGroup,
      distractors: ['A', 'B', 'O', 'AB'],
    },
    {
      id: 'province',
      question: 'บ้านเกิดของน้องการ์ตูนอยู่จังหวัดไหน?',
      answer: `จังหวัด${artist.province}`,
      distractors: ['อุบลราชธานี', 'สุรินทร์', 'ขอนแก่น', 'ศรีสะเกษ', 'บุรีรัมย์'].map((p) => `จังหวัด${p}`),
    },
    noodle && {
      id: 'noodle',
      question: 'ก๋วยเตี๋ยวแบบไหนที่น้องการ์ตูนชอบ?',
      answer: noodle,
      distractors: ['ก๋วยเตี๋ยวต้มยำผักเยอะ ๆ', 'เย็นตาโฟใส่ผักบุ้ง', 'บะหมี่เกี๊ยวโรยผักชี'],
    },
    animal && {
      id: 'animal',
      question: 'ข้อไหนอยู่ในรายการ "ของที่ชอบ" ของน้องการ์ตูน?',
      answer: animal,
      distractors: ['นกแก้ว', 'ปลาทอง', 'เต่า', 'หนูแฮมสเตอร์'],
    },
    {
      id: 'hobby',
      question: 'ข้อไหนเป็นงานอดิเรกของน้องการ์ตูน?',
      answer: pickFrom(artist.hobbies, rng),
      distractors: ['ตกปลา', 'ปลูกต้นไม้', 'ถ่ายรูปฟิล์ม', 'ปั่นจักรยาน'],
    },
    mv && {
      id: 'mv',
      question: 'เพลงไหนที่น้องการ์ตูนมี MV อยู่ในหน้าวิดีโอ?',
      answer: songOf(mv.title),
      distractors: ['คุกกี้เสี่ยงทาย', 'Heavy Rotation', 'River'],
    },
    variety && {
      id: 'variety',
      question: 'รายการวาไรตี้ที่น้องการ์ตูนออกบ่อย ๆ ชื่ออะไร?',
      answer: showOf(variety.title),
      distractors: ['ลองมั้ยคะ', 'ตูนพาเที่ยว', 'ห้องเรียนน้องตูน'],
    },
    {
      id: 'name',
      question: 'ชื่อจริงของน้องการ์ตูนคือข้อไหน?',
      answer: artist.nameTh,
      distractors: ['ณัฐธิดา ณ อยุธยา', 'ณัฎฐนิชา ณ อัมภัย', 'ณัฎฐธิดา อัมพร'],
    },
  ].filter(Boolean);
}

function shuffle(list, rng) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// สุ่มลำดับคำถามและตัวเลือก คืน [{ id, question, answer, choices: [4 ตัวเลือก] }]
export function buildQuiz(rng = Math.random) {
  return shuffle(questionBank(rng), rng).slice(0, QUESTION_COUNT).map((q) => {
    const wrong = shuffle([...new Set(q.distractors)].filter((d) => d !== q.answer), rng).slice(0, 3);
    return { id: q.id, question: q.question, answer: q.answer, choices: shuffle([q.answer, ...wrong], rng) };
  });
}

// ระดับตามคะแนน
export function rankOf(score, total = QUESTION_COUNT) {
  if (score >= total) return { title: 'โอชิตัวจริง 100%!', note: 'รู้จักน้องการ์ตูนครบทุกข้อ' };
  if (score >= total * 0.8) return { title: 'โอตะตัวจริง', note: 'รู้จักน้องเกือบหมดแล้ว' };
  if (score >= total * 0.5) return { title: 'แฟนตัวยง', note: 'อีกนิดเดียวจะเป็นโอตะแล้ว' };
  return { title: 'แฟนมือใหม่', note: 'ลองไปอ่าน "เกี่ยวกับน้อง" ที่หน้าหลักแล้วกลับมาใหม่นะ' };
}
