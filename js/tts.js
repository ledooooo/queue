/* ----------  config (admin can change)  ---------- */
const CFG = {
  dir: 'audio/',               // change to file:///sdcard/GharbAlmatarQueue/audio/ on TV
  speed: Number(localStorage.getItem('ttsSpeed')  || 1),   // 0.5 .. 2
  volume: Number(localStorage.getItem('ttsVol')  || 1),   // 0 .. 1
  wa: localStorage.getItem('ttsWa') !== '0'               // و / بدون و
};

/* ----------  internal queue  ---------- */
let queue = [], playing = false;

/* ----------  play one file  ---------- */
function playOne(f) {
  return new Promise(res => {
    const a = new Audio(CFG.dir + f);
    a.volume = CFG.volume;
    a.playbackRate = CFG.speed;
    a.addEventListener('ended', res, {once: true});
    a.play().catch(() => res());
  });
}

/* ----------  number → file list (correct order)  ---------- */
/* ----------  رقم 0-99 → ملفات بالترتيب الصحيح ---------- */
function numberFiles(n) {
  if (n === 0) return ['0.mp3'];
  if (n <= 10) return [`${n}.mp3`];

  const ones = n % 10;
  const tens = Math.floor(n / 10) * 10;
  const out = [];

  // أولاً: الآحاد إن وُجدت
  if (ones > 0) out.push(`${ones}.mp3`);

  // ثانياً: «و» (اختيارى)
  if (CFG.wa && ones > 0) out.push('wa.mp3');

  // أخيراً: العشرة
  out.push(`${tens}.mp3`);
  return out;
}

/* ----------  queue runner  ---------- */
async function runner() {
  if (playing) return;
  playing = true;
  while (queue.length) {
    const list = queue.shift();
    for (const f of list) await playOne(f);
  }
  playing = false;
}

/* ----------  main speak (adds to queue)  ---------- */
export function speak(text) {
  const list = [];
  if (text.startsWith('على العميل رقم')) {
    list.push('prefix.mp3');
    const n = Number(text.match(/\d+/)[0]);
    list.push(...numberFiles(n));
    list.push('suffix.mp3');
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
  speak(`على العميل رقم ${num} التوجه إلى عيادة ${clinicName}`);
}
export function speakReset() {
  speak('تمت إعادة التعيين');
}

/* ----------  admin panel controls (add anywhere in admin.html)  ---------- */
export function buildAdminControls(parentId = 'adminControls') {
  const html = `
  <div id="${parentId}" class="bg-white p-4 rounded-xl shadow mt-4 space-y-3">
    <h3 class="font-bold text-[#004156]">إعدادات الصوت</h3>
    <label class="block">السرعة <input id="ttsSpeed" type="range" min="0.5" max="2" step="0.1" value="${CFG.speed}" class="w-full"></label>
    <label class="block">الصوت <input id="ttsVol"  type="range" min="0"   max="1" step="0.1" value="${CFG.volume}" class="w-full"></label>
    <label class="flex items-center gap-2"><input id="ttsWa" type="checkbox" ${CFG.wa ? 'checked' : ''}> استخدام "و"</label>
    <button id="saveTts" class="w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-800">حفظ الإعدادات</button>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);

  document.getElementById('saveTts').onclick = () => {
    localStorage.setItem('ttsSpeed', document.getElementById('ttsSpeed').value);
    localStorage.setItem('ttsVol',   document.getElementById('ttsVol').value);
    localStorage.setItem('ttsWa',    document.getElementById('ttsWa').checked ? '1' : '0');
    alert('تم الحفظ – أعد تحميل الصفحة لتطبيق التغييرات');
  };
}

