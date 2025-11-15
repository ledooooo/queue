/* ----------  إعدادات عامة (تُقرأ من localStorage)  ---------- */
const CFG = {
  dir: 'audio/',   // غيّره لاحقاً إلى المسار الكامل على التلفاز
  speed: Number(localStorage.getItem('ttsSpeed') || 1),
  volume: Number(localStorage.getItem('ttsVol') || 1),
  wa: localStorage.getItem('ttsWa') !== '0'
};

/* ----------  queue لمنع التشابك  ---------- */
let queue = [], playing = false;

/* ----------  تشغيل ملف واحد  ---------- */
function playOne(f) {
  return new Promise(res => {
    const a = new Audio(CFG.dir + f);
    a.volume = CFG.volume;
    a.playbackRate = CFG.speed;
    a.addEventListener('ended', res, {once: true});
    a.play().catch(() => res());
  });
}

/* ----------  رقم 0-99 بالترتيب الصحيح (آحاد + و + عشرات)  ---------- */
function numberFiles(n) {
  if (n === 0) return ['0.mp3'];
  if (n <= 10) return [`${n}.mp3`];

  const ones = n % 10, tens = Math.floor(n / 10) * 10;
  const out = [];
  if (ones > 0) out.push(`${ones}.mp3`);
  if (CFG.wa && ones > 0 && tens > 0) out.push('wa.mp3');
  if (tens > 0) out.push(`${tens}.mp3`);
  return out;
}

/* ----------  تشغيل الدور  ---------- */
async function runner() {
  if (playing) return;
  playing = true;
  while (queue.length) {
    const list = queue.shift();
    for (const f of list) await playOne(f);
  }
  playing = false;
}

/* ----------  main speak  ---------- */
export function speak(text) {
  const list = [];
  if (text.startsWith('على العميل رقم')) {
    list.push('prefix.mp3');                       // «على العميل رقم»
    const n = Number(text.match(/\d+/)[0]);        // الرقم
    list.push(...numberFiles(n));                  // الآحاد والعشرات

    // استخراج اسم العيادة (بعد «عيادة» أو «إلى»)
    const m = text.match(/عيادة ([\w\u0600-\u06FF_]+)/) || text.match(/إلى ([\w\u0600-\u06FF_]+)/);
    if (m) list.push(`clinic_${m[1]}.mp3`);        // «عيادة طب الأسرة»
    else list.push('suffix.mp3');                  // fallback
  } else if (text === 'تمت إعادة التعيين') {
    list.push('reset.mp3');
  } else {
    const m = text.match(/\d+/);
    if (m) list.push(...numberFiles(Number(m[0])));
  }
  queue.push(list);
  runner();
}

/* ----------  helpers (unchanged signature)  ---------- */
export function announce(clinicName, num) {
  const id = clinicName.replace(/\s+/g, '_');      // استبدال المسافات بـ _
  speak(`على العميل رقم ${num} التوجه إلى عيادة ${id}`);
}
export function speakReset() {
  speak('تمت إعادة التعيين');
}

/* ----------  بناء عنصر تحكم السرعة لصفحة admin  ---------- */
export function buildSpeedControl(parentId = 'adminSpeed') {
  const spd = localStorage.getItem('ttsSpeed') || '1';
  const html = `
  <div id="${parentId}" class="bg-white p-4 rounded-xl shadow mt-4 max-w-md mx-auto space-y-3">
    <h3 class="font-bold text-[#004156]">سرعة النطق</h3>
    <div class="flex items-center gap-3">
      <input id="speedRange" type="range" min="0.5" max="2" step="0.1" value="${spd}" class="flex-1">
      <span id="speedVal" class="w-10 text-center text-sm">${spd}</span>
    </div>
    <button id="saveSpeedBtn" class="w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-800">حفظ السرعة</button>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  const range = document.getElementById('speedRange');
  const val   = document.getElementById('speedVal');
  range.addEventListener('input', () => val.textContent = range.value);

  document.getElementById('saveSpeedBtn').onclick = () => {
    localStorage.setItem('ttsSpeed', range.value);
    alert('تم الحفظ – أعد تحميل الصفحة لتطبيق السرعة الجديدة');
  };
}
