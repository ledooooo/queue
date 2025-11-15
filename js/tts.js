/* ----------  off-line MP3 TTS  ---------- */
const AUDIO_DIR = 'audio/';          // change to '../audio/' or absolute path if needed

/* play one file */
function play(f) {
  return new Promise(res => {
    const a = new Audio(AUDIO_DIR + f);
    a.addEventListener('ended', res, {once: true});
    a.play().catch(() => res());     // ignore blocked autoplay
  });
}

/* convert 0-99 → file list */
function numberFiles(n) {
  if (n === 0) return ['0.mp3'];
  const ones = n % 10;
  const tens = n - ones;
  const arr = [];
  if (tens > 0) arr.push(`${tens}.mp3`);
  if (ones > 0)  arr.push(`${ones}.mp3`);
  return arr;
}

/* main speak */
export async function speak(text) {
  const list = [];
  if (text.startsWith('على العميل رقم')) {
    list.push('prefix.mp3');                       // “على العميل رقم”
    const n = Number(text.match(/\d+/)[0]);        // extract number
    list.push(...numberFiles(n));                  // ones + tens
    list.push('suffix.mp3');                       // “التوجه إلى عيادة”
  } else if (text === 'تمت إعادة التعيين') {
    list.push('reset.mp3');
  } else {                                         // fallback
    const m = text.match(/\d+/);
    if (m) list.push(...numberFiles(Number(m[0])));
  }
  /* play chain */
  for (const f of list) await play(f);
}

/* helpers (unchanged signature) */
export async function announce(clinicName, num) {
  await speak(`على العميل رقم ${num} التوجه إلى عيادة ${clinicName}`);
}
export async function speakReset() {
  await speak('تمت إعادة التعيين');
}
